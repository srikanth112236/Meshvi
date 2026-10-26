import { Platform } from 'react-native';
import { SafeStorage } from './storage';

// Environment Configuration
const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
const envBackendIp = process.env.EXPO_PUBLIC_BACKEND_IP || '192.168.1.6';
const envPort = process.env.EXPO_PUBLIC_BACKEND_PORT || '3500';

// Base URL candidates based on execution environment
export const LAN_API_URL: string = envApiUrl || `http://${envBackendIp}:${envPort}/api/v1`;
export const LOCALHOST_API_URL: string = `http://localhost:${envPort}/api/v1`;
export const ANDROID_EMULATOR_API_URL: string = `http://10.0.2.2:${envPort}/api/v1`;

let activeBaseUrl: string | null = null;

export async function getWorkingApiBaseUrl(): Promise<string> {
  if (activeBaseUrl) return activeBaseUrl;

  // For Web platform, localhost is always prioritized
  if (Platform.OS === 'web') {
    activeBaseUrl = LOCALHOST_API_URL;
    return activeBaseUrl;
  }

  // Attempt LAN IP first (for physical Android/iOS devices on same Wi-Fi)
  const candidateUrls = [LAN_API_URL, LOCALHOST_API_URL, ANDROID_EMULATOR_API_URL];

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800);
      const res = await fetch(`${url}/health`, {
        signal: controller.signal,
      }).catch(() => null);
      clearTimeout(timeoutId);

      if (res && res.status < 500) {
        activeBaseUrl = url;
        return activeBaseUrl;
      }
    } catch {
      // Continue to next candidate
    }
  }

  // Default to LAN IP if probe completes without definitive answer
  activeBaseUrl = LAN_API_URL;
  return activeBaseUrl;
}

export async function getAuthToken(): Promise<string | null> {
  try {
    return await SafeStorage.getItem('@meshvi_token');
  } catch {
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SafeStorage.getItem('@meshvi_refresh_token');
  } catch {
    return null;
  }
}

// Session expired event listeners
type SessionExpiredHandler = () => void;
const sessionExpiredListeners = new Set<SessionExpiredHandler>();

export function onSessionExpired(handler: SessionExpiredHandler): () => void {
  sessionExpiredListeners.add(handler);
  return () => {
    sessionExpiredListeners.delete(handler);
  };
}

export function notifySessionExpired() {
  sessionExpiredListeners.forEach((fn) => {
    try {
      fn();
    } catch {}
  });
}

function safeBase64Decode(str: string): string {
  try {
    if (typeof atob === 'function') {
      return atob(str);
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    const cleanStr = String(str).replace(/=+$/, '');
    for (
      let bc = 0, bs = 0, buffer, idx = 0;
      (buffer = cleanStr.charAt(idx++));
      ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
        ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
        : 0
    ) {
      buffer = chars.indexOf(buffer);
    }
    return output;
  } catch {
    return '';
  }
}

export function isJwtExpired(jwt: string): boolean {
  try {
    const parts = jwt.split('.');
    if (parts.length < 2) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = decodeURIComponent(
      safeBase64Decode(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonStr);
    if (!payload.exp) return false;
    // Considered expired if current time + 15 seconds is >= exp
    return Math.floor(Date.now() / 1000) + 15 >= payload.exp;
  } catch {
    return false;
  }
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      isRefreshing = false;
      return null;
    }

    try {
      const baseUrl = await getWorkingApiBaseUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${baseUrl}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const json = await res.json().catch(() => null);
      if (res.ok && json?.success && (json?.data?.accessToken || json?.data?.token)) {
        const newAccess = json.data.accessToken || json.data.token;
        await SafeStorage.setItem('@meshvi_token', newAccess);
        if (json.data.refreshToken) {
          await SafeStorage.setItem('@meshvi_refresh_token', json.data.refreshToken);
        }
        return newAccess;
      }
    } catch {
      // Refresh network error
    } finally {
      isRefreshing = false;
    }
    return null;
  })();

  return refreshPromise;
}

export async function resolveValidJwt(candidateToken?: string | null): Promise<string | null> {
  // If candidate token provided and valid, return it
  if (candidateToken && candidateToken.startsWith('eyJ') && !isJwtExpired(candidateToken)) {
    return candidateToken;
  }

  // Check stored access token
  const stored = await getAuthToken();
  if (stored && stored.startsWith('eyJ') && !isJwtExpired(stored)) {
    return stored;
  }

  // Access token expired or missing: attempt transparent 24h refresh
  const storedRefresh = await getRefreshToken();
  if (storedRefresh) {
    const freshToken = await refreshAccessToken();
    if (freshToken && !isJwtExpired(freshToken)) {
      return freshToken;
    }
  }

  // If a session existed previously but refresh failed, trigger session expiry
  if (stored) {
    notifySessionExpired();
  }

  return null;
}

export async function apiRequest<T = any>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: any;
    token?: string | null;
    timeoutMs?: number;
    _isRetry?: boolean;
  } = {}
): Promise<{ success: boolean; data?: T; error?: string; statusCode?: number }> {
  const baseUrl = await getWorkingApiBaseUrl();
  const rawToken = options.token !== undefined ? options.token : await getAuthToken();
  const token = await resolveValidJwt(rawToken);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${baseUrl}${cleanPath}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token && token.trim().length > 0 && !token.startsWith('token_mock_')) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 8000);

  try {
    const res = await fetch(fullUrl, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      // Automatic transparent 401 JWT refresh retry
      if (res.status === 401 && !options._isRetry) {
        const freshToken = await refreshAccessToken();
        if (freshToken) {
          return apiRequest<T>(path, { ...options, token: freshToken, _isRetry: true });
        } else {
          notifySessionExpired();
        }
      }

      return {
        success: false,
        statusCode: res.status,
        error: json?.error?.message || json?.message || json?.error || `HTTP Error ${res.status}`,
      };
    }

    return {
      success: true,
      statusCode: res.status,
      data: json?.data !== undefined ? json.data : json,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);

    // If LAN IP failed, try localhost fallback immediately
    if (baseUrl !== LOCALHOST_API_URL) {
      try {
        const fallbackUrl = `${LOCALHOST_API_URL}${cleanPath}`;
        const fallbackRes = await fetch(fallbackUrl, {
          method: options.method || 'GET',
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
        });
        const fallbackJson = await fallbackRes.json().catch(() => null);
        if (fallbackRes.ok) {
          activeBaseUrl = LOCALHOST_API_URL;
          return {
            success: true,
            statusCode: fallbackRes.status,
            data: fallbackJson?.data !== undefined ? fallbackJson.data : fallbackJson,
          };
        }
      } catch {
        // Both failed
      }
    }

    return {
      success: false,
      error: err.name === 'AbortError' ? 'Connection timed out' : err.message || 'Network request failed',
    };
  }
}
