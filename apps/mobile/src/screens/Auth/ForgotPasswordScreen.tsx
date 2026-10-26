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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onBackToLogin }) => {
  const insets = useSafeAreaInsets();
  const { forgotPassword, resetPassword } = useAuth();
  const { showSuccess } = useModal();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(600); // 10 minutes

  useEffect(() => {
    if (step === 2) {
      const timer = setInterval(() => {
        setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError('Please provide your corporate work email.');
      return;
    }
    setError('');
    setLoading(true);

    const res = await forgotPassword(email.trim().toLowerCase());
    setLoading(false);
    if (res.success) {
      setStep(2);
      setSecondsLeft(600);
      setSuccessMsg('A 6-digit clearance reset code has been dispatched.');
    } else {
      setError(res.error || 'Failed to dispatch reset code.');
    }
  };

  const handleResetPassword = async () => {
    if (!code || code.length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);

    const res = await resetPassword(email.trim().toLowerCase(), code, newPassword);
    setLoading(false);
    if (res.success) {
      showSuccess(
        'Credentials Re-Secured',
        'Your password has been successfully calibrated and updated. Please authenticate with your new credentials.',
        'Proceed to Login',
        onBackToLogin
      );
    } else {
      setError(res.error || 'Password reset rejected.');
    }
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
          {/* Header */}
          <View style={styles.headerBar}>
            <TouchableOpacity onPress={onBackToLogin} style={styles.backBtn} activeOpacity={0.7}>
              <Feather name="arrow-left" size={18} color={COLORS.text} />
            </TouchableOpacity>
            {step === 2 && (
              <View style={styles.timerBadge}>
                <Feather name="clock" size={13} color={COLORS.primary} style={{ marginRight: 5 }} />
                <Text style={styles.timerText}>{formatTimer(secondsLeft)}</Text>
              </View>
            )}
          </View>

          <View style={styles.titleSection}>
            <Image
              source={require('../../../assets/icon.png')}
              style={{ width: 54, height: 54, borderRadius: 14, marginBottom: 12 }}
              resizeMode="contain"
            />
            <Text style={styles.title}>Password Clearance Reset</Text>
            <Text style={styles.subtitle}>
              {step === 1
                ? 'Enter your work email to receive a 10-minute temporary clearance key.'
                : `Enter the 6-digit code dispatched to ${email}`}
            </Text>
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={16} color={COLORS.rose} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {successMsg ? (
            <View style={styles.successBanner}>
              <Feather name="check-circle" size={16} color={COLORS.emerald} />
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          ) : null}

          <View style={styles.formCard}>
            {step === 1 ? (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Corporate Work Email</Text>
                  <View style={styles.inputContainer}>
                    <Feather name="mail" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="name@company.com"
                      placeholderTextColor={COLORS.textMuted}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSendCode}
                  disabled={loading}
                  activeOpacity={0.88}
                >
                  <LinearGradient
                    colors={[COLORS.primary, '#0040D0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.white} size="small" />
                    ) : (
                      <>
                        <Text style={styles.submitText}>Dispatch 10-Min Reset Code</Text>
                        <Feather name="arrow-right" size={18} color={COLORS.white} />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* 6-digit code */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>6-Digit Verification Code</Text>
                  <View style={styles.inputContainer}>
                    <Feather name="shield" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 123456"
                      placeholderTextColor={COLORS.textMuted}
                      value={code}
                      onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                {/* New Password */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.inputContainer}>
                    <Feather name="lock" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="At least 8 characters"
                      placeholderTextColor={COLORS.textMuted}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                    />
                  </View>
                </View>

                {/* Confirm Password */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Confirm New Password</Text>
                  <View style={styles.inputContainer}>
                    <Feather name="lock" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Repeat new password"
                      placeholderTextColor={COLORS.textMuted}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleResetPassword}
                  disabled={loading}
                  activeOpacity={0.88}
                >
                  <LinearGradient
                    colors={[COLORS.primary, '#0040D0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.white} size="small" />
                    ) : (
                      <>
                        <Text style={styles.submitText}>Confirm & Re-Authenticate</Text>
                        <Feather name="check" size={18} color={COLORS.white} />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>

          <TouchableOpacity style={styles.backToLoginBtn} onPress={onBackToLogin} activeOpacity={0.7}>
            <Feather name="arrow-left" size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.backToLoginText}>Back to Sign In</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  timerText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  titleSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#DBEAFE',
    marginBottom: 14,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 16,
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
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 16,
  },
  successText: {
    color: COLORS.emerald,
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
    marginTop: 6,
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
  backToLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  backToLoginText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
