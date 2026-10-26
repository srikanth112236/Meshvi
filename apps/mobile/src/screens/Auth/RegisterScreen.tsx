import React, { useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, MeshviColors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { GoogleAuthModal } from '../../components/GoogleAuthModal';
import { launchGoogleOAuth } from '../../services/googleAuth';

interface RegisterScreenProps {
  onLogin: (email?: string) => void;
  onOtpVerification: (email: string) => void;
  onForgotPassword?: (email?: string) => void;
  onBack: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onLogin,
  onOtpVerification,
  onForgotPassword,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const { registerInit, quickDemoLogin, loginWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [existingAccountInfo, setExistingAccountInfo] = useState<{
    email: string;
    message: string;
  } | null>(null);

  const handleGoogleRegister = () => {
    setError('');
    setShowGoogleModal(true);
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !mobile.trim()) {
      setError('Please fill in all mandatory corporate fields.');
      return;
    }
    setError('');
    setExistingAccountInfo(null);
    setLoading(true);

    const res = await registerInit({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      companyName: companyName.trim() || undefined,
      password,
    });

    setLoading(false);
    if (res.success) {
      setExistingAccountInfo(null);
      onOtpVerification(email.trim().toLowerCase());
    } else {
      const errMsg = res.error || 'Registration initiation failed.';
      if (
        errMsg.toLowerCase().includes('already') ||
        errMsg.toLowerCase().includes('registered') ||
        errMsg.toLowerCase().includes('exists')
      ) {
        setExistingAccountInfo({
          email: email.trim().toLowerCase(),
          message: errMsg,
        });
      } else {
        setError(errMsg);
      }
    }
  };

  const handleQuickDemo = async () => {
    setDemoLoading(true);
    await quickDemoLogin();
    setDemoLoading(false);
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 16) }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar */}
          <View style={styles.headerBar}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <Feather name="arrow-left" size={18} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.headerBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.headerBadgeText}>MESHVI Organization Gateway</Text>
            </View>
          </View>

          {/* Title */}
          <View style={styles.titleSection}>
            <Image
              source={require('../../../assets/icon.png')}
              style={{ width: 54, height: 54, borderRadius: 14, marginBottom: 12 }}
              resizeMode="contain"
            />
            <Text style={styles.title}>Register Organization</Text>
            <Text style={styles.subtitle}>
              A 6-digit real-time verification OTP will be dispatched to your corporate work email.
            </Text>
          </View>

          {/* Graceful Existing Account Alert Card */}
          {existingAccountInfo ? (
            <View style={styles.existingAccountCard}>
              <View style={styles.existingAccountHeader}>
                <View style={styles.existingAccountIconBox}>
                  <Feather name="user-check" size={18} color="#D97706" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.existingAccountTitle}>Email Already Registered</Text>
                  <Text style={styles.existingAccountMessage}>
                    {existingAccountInfo.message}
                  </Text>
                </View>
              </View>
              <View style={styles.existingAccountActions}>
                <TouchableOpacity
                  style={styles.signInDirectlyBtn}
                  onPress={() => onLogin(existingAccountInfo.email)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.signInDirectlyText}>Sign In to Account</Text>
                  <Feather name="arrow-right" size={14} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
                {onForgotPassword ? (
                  <TouchableOpacity
                    style={styles.resetPasswordBtn}
                    onPress={() => onForgotPassword(existingAccountInfo.email)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.resetPasswordText}>Reset Password</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ) : error ? (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={16} color={COLORS.rose} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.formCard}>
            {/* Google OAuth Quick Sign Up */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="google" size={18} color="#EA4335" style={{ marginRight: 8 }} />
              <Text style={styles.googleBtnText}>Sign up with Google</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or register with details</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Executive Full Name *</Text>
              <View style={styles.inputContainer}>
                <Feather name="user" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Rajiv Menon"
                  placeholderTextColor={COLORS.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Corporate Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Corporate Work Email *</Text>
              <View style={styles.inputContainer}>
                <Feather name="mail" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@organization.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (existingAccountInfo) setExistingAccountInfo(null);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Mobile */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Direct Corporate Phone *</Text>
              <View style={styles.inputContainer}>
                <Feather name="phone" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="+65 9123 4567"
                  placeholderTextColor={COLORS.textMuted}
                  value={mobile}
                  onChangeText={setMobile}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Company Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Company / Organization</Text>
              <View style={styles.inputContainer}>
                <Feather name="briefcase" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Acme Global Logistics"
                  placeholderTextColor={COLORS.textMuted}
                  value={companyName}
                  onChangeText={setCompanyName}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Create Password *</Text>
              <View style={styles.inputContainer}>
                <Feather name="lock" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="At least 8 characters"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleRegister}
              disabled={loading || demoLoading}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={[MeshviColors.primary, MeshviColors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <>
                    <Text style={styles.submitText}>Dispatch Verification OTP</Text>
                    <Feather name="arrow-right" size={18} color={COLORS.white} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Quick Demo Access Bypass */}
            <TouchableOpacity
              onPress={handleQuickDemo}
              disabled={loading || demoLoading}
              style={styles.quickDemoBtn}
              activeOpacity={0.78}
            >
              {demoLoading ? (
                <ActivityIndicator color={MeshviColors.accent} size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="lightning-bolt" size={16} color={MeshviColors.accent} style={{ marginRight: 6 }} />
                  <Text style={styles.quickDemoText}>Instant Preview: Demo Executive Login</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>Already have an enterprise account? </Text>
            <TouchableOpacity onPress={() => onLogin()} activeOpacity={0.7}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Google Authentication Modal */}
      <GoogleAuthModal
        visible={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        defaultEmail={email}
        defaultName={name}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.emerald,
    marginRight: 6,
  },
  headerBadgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  titleSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECDD3',
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.rose,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  googleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    paddingHorizontal: 10,
    letterSpacing: 0.5,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 46,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  submitText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
    marginRight: 6,
  },
  quickDemoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MeshviColors.surfaceMint,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.25)',
  },
  quickDemoText: {
    color: MeshviColors.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginPromptText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  existingAccountCard: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  existingAccountHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  existingAccountIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  existingAccountTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  existingAccountMessage: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 16,
  },
  existingAccountActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  signInDirectlyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.navy,
    borderRadius: 10,
    paddingVertical: 10,
  },
  signInDirectlyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  resetPasswordBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCD34D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetPasswordText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '700',
  },
});
