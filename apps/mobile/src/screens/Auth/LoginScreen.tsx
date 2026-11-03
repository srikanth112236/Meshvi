import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { launchGoogleOAuth } from '../../services/googleAuth';
import { GoogleIcon } from '../../components/GoogleIcon';
import { GoogleOneTapBottomSheet } from '../../components/GoogleOneTapBottomSheet';

interface LoginScreenProps {
  onRegister: () => void;
  onForgotPassword: () => void;
  onBack: () => void;
  initialEmail?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onRegister,
  onForgotPassword,
  onBack,
  initialEmail,
}) => {
  const insets = useSafeAreaInsets();
  const { login, loginWithGoogle, loginWithToken } = useAuth();
  const [email, setEmail] = useState(initialEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGoogleSheetVisible, setIsGoogleSheetVisible] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  // Direct Google OAuth: executes native Google Play Services SDK or dynamic Expo browser fallback
  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const res = await launchGoogleOAuth({ promptSelectAccount: true });
      if (res?.cancelled) {
        return;
      }
      if (res?.type === 'show_one_tap') {
        setIsGoogleSheetVisible(true);
        return;
      }
      if (res?.type === 'native' && res.idToken) {
        // Direct Native SDK Success: verify token with backend immediately
        const authRes = await loginWithGoogle({
          idToken: res.idToken,
          email: res.user?.email,
          displayName: res.user?.name,
          avatarUrl: res.user?.photo,
          googleId: res.user?.id,
        });
        if (!authRes.success) {
          setError(authRes.error || 'Failed to authenticate Google credentials.');
        }
        return;
      }
      if (res?.type === 'browser_session' && res.token) {
        // Direct In-App Browser Session Success (Expo Go / dynamic return)
        await loginWithToken(res.token, res.user, res.refreshToken);
        return;
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to launch Google authentication session.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please provide corporate email and password');
      return;
    }
    setError('');
    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Authentication rejected. Check credentials.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* TOP GRADIENT HEADER (Executive Meshvi Branding) */}
      <LinearGradient
        colors={['#071120', '#0B1D3A', '#0284C7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: Math.max(insets.top, 20) + 8 }]}
      >
        {/* Top Action Row */}
        <View style={styles.topNavRow}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backCircleBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="chevron-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.registerPromptRow}>
            <Text style={styles.registerPromptText}>Don't have an account?</Text>
            <TouchableOpacity
              onPress={onRegister}
              style={styles.getStartedPill}
              activeOpacity={0.8}
            >
              <Text style={styles.getStartedPillText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Center Brand Title */}
        <View style={styles.brandTitleContainer}>
          <Text style={styles.brandTitle}>Meshvi</Text>
          <Text style={styles.brandSubtitle}>Verified Executive Network</Text>
        </View>
      </LinearGradient>

      {/* FLOATING WHITE AUTH CARD */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.cardScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={[styles.mainCard, { paddingBottom: Math.max(insets.bottom, 20) + 16 }]}>
            {/* Header Titles */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Welcome Back</Text>
              <Text style={styles.cardSubtitle}>Enter your details below</Text>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorBanner}>
                <Feather name="alert-circle" size={15} color={COLORS.rose} style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* 1. Official Google OAuth Button (Positioned at Top, Matching Web) */}
            <TouchableOpacity
              onPress={handleGoogleLogin}
              disabled={googleLoading || loading}
              style={styles.googleOAuthBtn}
              activeOpacity={0.8}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color="#4285F4" style={{ marginRight: 10 }} />
              ) : (
                <GoogleIcon size={20} style={{ marginRight: 10 }} />
              )}
              <Text style={styles.googleOAuthBtnText}>
                {googleLoading ? 'Opening Google...' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>

            {/* Divider: or sign in with email */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or sign in with email</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Field 1: Email Address */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Work Email</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.inputField}
                  placeholder="executive@company.com"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Field 2: Password */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.inputField, { flex: 1, paddingRight: 8 }]}
                  placeholder="••••••••••••"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeToggleBtn}
                  activeOpacity={0.7}
                >
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In Primary CTA Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading || googleLoading}
              activeOpacity={0.85}
              style={styles.submitBtnWrapper}
            >
              <LinearGradient
                colors={['#0284C7', '#0369A1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitBtnGradient}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={onForgotPassword}
              style={styles.forgotPasswordContainer}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <GoogleOneTapBottomSheet
        visible={isGoogleSheetVisible}
        onClose={() => setIsGoogleSheetVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071120',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    minHeight: 200,
    justifyContent: 'space-between',
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerPromptText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginRight: 8,
    fontWeight: '500',
  },
  getStartedPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  getStartedPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  brandTitleContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  keyboardView: {
    flex: 1,
    marginTop: -24,
  },
  cardScrollContent: {
    flexGrow: 1,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 28,
    flex: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#BE123C',
    fontWeight: '600',
    flex: 1,
  },
  googleOAuthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  googleIconImg: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleOAuthBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 11,
    color: '#94A3B8',
    paddingHorizontal: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputField: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    paddingVertical: 3,
    flex: 1,
  },
  eyeToggleBtn: {
    padding: 6,
  },
  submitBtnWrapper: {
    marginTop: 6,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 18,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
});
