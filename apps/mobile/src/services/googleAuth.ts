import { Linking, Platform } from 'react-native';
import { apiRequest } from './api';

export async function launchGoogleOAuth(options?: { promptSelectAccount?: boolean }) {
  const state = `mobile_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // Google OAuth 2.0 strictly requires authorized redirect URIs (localhost or registered HTTPS domain).
  // Private IPs (like 192.168.x.x) are rejected with "Access blocked: authorization error (redirect_uri_mismatch)".
  const redirectUri =
    process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI || 'https://setu-frontend.onrender.com/auth/google/callback';

  // 1. Try to get dynamic OAuth initiation URL from backend
  try {
    const res = await apiRequest<{ url?: string; clientId?: string }>(
      `/auth/google/url?state=${state}&redirectUri=${encodeURIComponent(redirectUri)}`
    );
    if (res.success && res.data?.url) {
      let finalUrl = res.data.url;
      if (options?.promptSelectAccount && !finalUrl.includes('prompt=')) {
        finalUrl += '&prompt=select_account';
      }
      await Linking.openURL(finalUrl);
      return;
    }
  } catch {}

  // 2. Direct Fallback: Google OAuth 2.0 Account Selector Screen
  const clientId =
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
    '1063250494735-h91upf3htdi4ms53aukttj9lgdenj5ia.apps.googleusercontent.com';

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=openid%20profile%20email&state=${state}&access_type=offline&prompt=select_account`;

  await Linking.openURL(authUrl);
}
