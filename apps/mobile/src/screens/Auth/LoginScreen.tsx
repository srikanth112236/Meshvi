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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { GoogleAuthModal } from '../../components/GoogleAuthModal';

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
  const { login, quickDemoLogin } = useAuth();
  const [email, setEmail] = useState(initialEmail || 'aditi.park@novus-infrastructure-101-singapore.com');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleGoogleLogin = () => {
    setError('');
    setShowGoogleModal(true);
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

      {/* TOP GRADIENT HEADER (Matching Reference UI) */}
      <LinearGradient
        colors={['#071120', '#0B1D3A', '#0284C7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: Math.max(insets.top, 20) + 8 }]}
      >
        {/* Top Action Row: Back Button & "Don't have an account? Get Started" */}
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

      {/* BOTTOM FLOATING WHITE CARD (Matching Reference UI) */}
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

            {/* Field 1: Email Address */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.inputField}
                  placeholder="name@company.com"
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

            {/* Sign In Primary CTA Button (LinearGradient) */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
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

            {/* Divider: Or sign in with */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or sign in with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Single Google OAuth Button (No Facebook) */}
            <TouchableOpacity
              onPress={handleGoogleLogin}
              disabled={loading}
              style={styles.googleOAuthBtn}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="google" size={19} color="#EA4335" style={{ marginRight: 8 }} />
              <Text style={styles.googleOAuthBtnText}>Google</Text>
            </TouchableOpacity>

            {/* Quick Demo Pre-fill Option */}
            <TouchableOpacity
              onPress={quickDemoLogin}
              style={styles.quickDemoPill}
              activeOpacity={0.7}
            >
              <Feather name="zap" size={12} color="#0284C7" style={{ marginRight: 4 }} />
              <Text style={styles.quickDemoText}>Instant Demo Clearance (Aditi Park, VP)</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Google OAuth Modal */}
      <GoogleAuthModal
        visible={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
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
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  getStartedPillText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  brandTitleContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  keyboardView: {
    flex: 1,
  },
  cardScrollContent: {
    flexGrow: 1,
  },
  mainCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 30,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#B91C1C',
    fontWeight: '600',
    flex: 1,
  },
  fieldContainer: {
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputField: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    paddingVertical: 2,
  },
  eyeToggleBtn: {
    padding: 6,
  },
  submitBtnWrapper: {
    marginTop: 8,
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
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 12,
    color: '#94A3B8',
    paddingHorizontal: 12,
    fontWeight: '500',
  },
  googleOAuthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  googleOAuthBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  quickDemoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginTop: 16,
    alignSelf: 'center',
  },
  quickDemoText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
});
