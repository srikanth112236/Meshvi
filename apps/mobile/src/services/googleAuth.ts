import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { apiRequest } from './api';

// Complete any active auth sessions when returning to the app
WebBrowser.maybeCompleteAuthSession();

export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
  '1063250494735-h91upf3htdi4ms53aukttj9lgdenj5ia.apps.googleusercontent.com';

export interface GoogleAuthResult {
  type: 'native' | 'browser' | 'browser_session' | 'show_one_tap';
  success: boolean;
  cancelled?: boolean;
  inProgress?: boolean;
  idToken?: string;
  token?: string;
  refreshToken?: string;
  user?: any;
  error?: string;
}

// Lazy load GoogleSignin to prevent runtime crash in environments where native module is unlinked (e.g. Expo Go)
let GoogleSigninModule: any = null;
let statusCodesModule: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const gSignin = require('@react-native-google-signin/google-signin');
  GoogleSigninModule = gSignin.GoogleSignin;
  statusCodesModule = gSignin.statusCodes;
  if (GoogleSigninModule && typeof GoogleSigninModule.configure === 'function') {
    GoogleSigninModule.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
      scopes: ['profile', 'email'],
    });
  }
} catch {
  // Suppress native module load failure in Expo Go or web
}

function safeBase64UrlEncode(str: string): string {
  try {
    if (typeof btoa === 'function') {
      return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
  } catch {}
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  for (let i = 0; i < str.length; i += 3) {
    const b1 = str.charCodeAt(i);
    const b2 = i + 1 < str.length ? str.charCodeAt(i + 1) : 0;
    const b3 = i + 2 < str.length ? str.charCodeAt(i + 2) : 0;
    const e1 = b1 >> 2;
    const e2 = ((b1 & 3) << 4) | (b2 >> 4);
    const e3 = i + 1 < str.length ? ((b2 & 15) << 2) | (b3 >> 6) : 64;
    const e4 = i + 2 < str.length ? b3 & 63 : 64;
    output += chars.charAt(e1) + chars.charAt(e2) + (e3 < 64 ? chars.charAt(e3) : '') + (e4 < 64 ? chars.charAt(e4) : '');
  }
  return output.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * End-to-end Google Authentication:
 * 1. Checks if Native Play Services SDK is linked (APK / EAS Build / Dev Client).
 * 2. If not (e.g. running in Expo Go development), launches in-app browser session
 *    with dynamically generated return scheme:
 *    - In Expo Go: exp://<ip>:8081/--/auth (opens Expo Go directly!)
 *    - In Standalone: meshvi://auth (opens installed APK directly!)
 */
export async function performGoogleSignIn(options?: {
  promptSelectAccount?: boolean;
}): Promise<GoogleAuthResult> {
  // 1. Try Native Google Sign-In SDK (APK / Dev Client)
  if (GoogleSigninModule && typeof GoogleSigninModule.signIn === 'function') {
    try {
      if (Platform.OS === 'android' && typeof GoogleSigninModule.hasPlayServices === 'function') {
        await GoogleSigninModule.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      const response = await GoogleSigninModule.signIn();

      if (response && response.type === 'success' && response.data) {
        return {
          type: 'native',
          success: true,
          idToken: response.data.idToken || undefined,
          user: {
            id: response.data.user.id,
            email: response.data.user.email,
            name: response.data.user.name || undefined,
            photo: response.data.user.photo || undefined,
            familyName: response.data.user.familyName || undefined,
            givenName: response.data.user.givenName || undefined,
          },
        };
      }

      if (response && response.type === 'cancelled') {
        return { type: 'native', success: false, cancelled: true };
      }
    } catch (err: any) {
      if (
        statusCodesModule &&
        (err?.code === statusCodesModule.SIGN_IN_CANCELLED ||
          err?.code === '12501' ||
          err?.message?.includes('cancelled') ||
          err?.message?.includes('Canceled'))
      ) {
        return { type: 'native', success: false, cancelled: true };
      }
      if (statusCodesModule && err?.code === statusCodesModule.IN_PROGRESS) {
        return { type: 'native', success: false, inProgress: true };
      }
    }
  }

  // 2. In Expo Go or unlinked environments, launch Google's official account selector
  // where ALL the user's real Google accounts on their phone are displayed.
  return await launchBrowserGoogleOAuth(options);
}

export async function launchBrowserGoogleOAuth(options?: {
  promptSelectAccount?: boolean;
}): Promise<GoogleAuthResult> {
  // Dynamically generate the exact return URL based on environment:
  // In Expo Go dev: exp://<ip>:8081/--/auth
  // In Standalone/APK: meshvi://auth
  const returnUrl = Linking.createURL('auth');
  const encodedReturn = safeBase64UrlEncode(returnUrl);
  const state = `mobile_${encodedReturn}_${Date.now()}`;

  const redirectUri =
    process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI || 'https://meshvi.org/auth/google/callback';

  let authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(
    GOOGLE_WEB_CLIENT_ID
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=openid%20profile%20email&state=${state}&access_type=offline&prompt=select_account`;

  try {
    const res = await apiRequest<{ url?: string; clientId?: string }>(
      `/auth/google/url?state=${state}&redirectUri=${encodeURIComponent(redirectUri)}`
    );
    if (res.success && res.data?.url) {
      authUrl = res.data.url;
      if (options?.promptSelectAccount && !authUrl.includes('prompt=')) {
        authUrl += '&prompt=select_account';
      }
    }
  } catch {}

  try {
    // Open in-app browser session listening for returnUrl (exp:// or meshvi://)
    const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl);

    if (result.type === 'success' && result.url) {
      const url = result.url;
      const queryString = url.includes('?') ? url.split('?')[1] : '';
      const params = new URLSearchParams(queryString);
      const token = params.get('token');
      const refreshToken = params.get('refreshToken') || undefined;
      const userJson = params.get('user');
      let parsedUser: any = null;
      if (userJson) {
        try {
          parsedUser = JSON.parse(decodeURIComponent(userJson));
        } catch {}
      }
      return {
        type: 'browser_session',
        success: true,
        token: token || undefined,
        refreshToken,
        user: parsedUser,
      };
    }

    if (result.type === 'cancel' || result.type === 'dismiss') {
      return { type: 'browser', success: false, cancelled: true };
    }
  } catch {
    // Fallback to system browser if custom tabs fail
    await Linking.openURL(authUrl);
  }

  return { type: 'browser', success: true };
}

// Preserve backward-compatibility for existing imports
export const launchGoogleOAuth = performGoogleSignIn;
