/**
 * Enterprise OAuth Configuration & Redirection Utilities for Meshvi
 * Ensures byte-for-byte URI matching with Google Cloud Console Credentials
 */

const PRODUCTION_CANONICAL_ORIGIN = 'https://meshvi.org';
const DEFAULT_GOOGLE_CLIENT_ID = '1063250494735-h91upf3htdi4ms53aukttj9lgdenj5ia.apps.googleusercontent.com';

/**
 * Returns the exact canonical redirect URI for Google OAuth.
 * Normalizes www.meshvi.org to meshvi.org to match Google Cloud Console whitelist.
 */
export function getCanonicalGoogleRedirectUri(): string {
  if (typeof window === 'undefined') {
    return `${PRODUCTION_CANONICAL_ORIGIN}/auth/google/callback`;
  }

  const origin = window.location.origin;

  // If running on meshvi production domains (meshvi.org or www.meshvi.org), use canonical
  if (origin.includes('meshvi.org')) {
    return `${PRODUCTION_CANONICAL_ORIGIN}/auth/google/callback`;
  }

  // Local development or preview deployments (e.g. localhost, onrender.com, azurestaticapps.net)
  return `${origin}/auth/google/callback`;
}

/**
 * Returns the effective Google Client ID.
 */
export function getGoogleClientId(customOverride?: string): string {
  if (customOverride && customOverride.trim()) {
    return customOverride.trim();
  }

  const envClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
  if (envClientId && typeof envClientId === 'string' && envClientId.trim() && !envClientId.includes('placeholder')) {
    return envClientId.trim();
  }

  return DEFAULT_GOOGLE_CLIENT_ID;
}

/**
 * Saves the active OAuth handshake metadata before redirecting to Google.
 */
export function saveOAuthHandshakeState(redirectUri: string, state: string) {
  try {
    sessionStorage.setItem('meshvi_oauth_redirect_uri', redirectUri);
    sessionStorage.setItem('meshvi_oauth_state', state);
  } catch {}
}

/**
 * Retrieves the stored redirect URI used when the user clicked "Sign in with Google",
 * or falls back to the canonical redirect URI.
 */
export function getStoredOAuthRedirectUri(): string {
  try {
    const stored = sessionStorage.getItem('meshvi_oauth_redirect_uri');
    if (stored && stored.trim()) {
      return stored.trim();
    }
  } catch {}
  return getCanonicalGoogleRedirectUri();
}

/**
 * Clears the stored OAuth handshake metadata once the exchange completes.
 */
export function clearOAuthHandshakeState() {
  try {
    sessionStorage.removeItem('meshvi_oauth_redirect_uri');
    sessionStorage.removeItem('meshvi_oauth_state');
  } catch {}
}
