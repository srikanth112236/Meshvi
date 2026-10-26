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

interface OtpVerificationScreenProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

export const OtpVerificationScreen: React.FC<OtpVerificationScreenProps> = ({ email, onSuccess, onBack }) => {
  const insets = useSafeAreaInsets();
  const { verifyOtp } = useAuth();
  const [otp, setOtp] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(600); // 10 minutes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 10-minute timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (otp.length < 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }
    setError('');
    setLoading(true);

    const res = await verifyOtp(email, otp);
    setLoading(false);
    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || 'Invalid or expired OTP code.');
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
          {/* Top Bar */}
          <View style={styles.headerBar}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <Feather name="arrow-left" size={18} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.timerPill}>
              <Feather name="clock" size={13} color={COLORS.primary} style={{ marginRight: 5 }} />
              <Text style={styles.timerText}>{formatTimer(secondsLeft)}</Text>
            </View>
          </View>

          <View style={styles.content}>
            <Image
              source={require('../../../assets/icon.png')}
              style={{ width: 54, height: 54, borderRadius: 14, marginBottom: 14 }}
              resizeMode="contain"
            />

            <Text style={styles.title}>Email OTP Verification</Text>
            <Text style={styles.subtitle}>
              We dispatched a 6-digit clearance code to:
            </Text>
            <Text style={styles.emailHighlight}>{email || 'your-email@company.com'}</Text>

            {error ? (
              <View style={styles.errorBanner}>
                <Feather name="alert-circle" size={16} color={COLORS.rose} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* 6-digit OTP Input Card */}
            <View style={styles.otpCard}>
              <Text style={styles.otpLabel}>ENTER 6-DIGIT VERIFICATION CODE</Text>
              <TextInput
                style={styles.otpInput}
                value={otp}
                onChangeText={(txt) => setOtp(txt.replace(/[^0-9]/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="• • • • • •"
                placeholderTextColor={COLORS.textMuted}
                autoFocus
              />

              {/* Quick Demo Fill Pill */}
              <TouchableOpacity
                style={styles.demoPill}
                onPress={() => setOtp('123456')}
                activeOpacity={0.7}
              >
                <Feather name="zap" size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
                <Text style={styles.demoPillText}>Auto-fill test code (123456)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.verifyBtn}
                onPress={handleVerify}
                disabled={loading}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={[COLORS.primary, '#0040D0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.verifyGradient}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <>
                      <Text style={styles.verifyText}>Verify Code & Launch Onboarding</Text>
                      <Feather name="arrow-right" size={18} color={COLORS.white} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Didn't receive the email? </Text>
              <TouchableOpacity onPress={() => setSecondsLeft(600)}>
                <Text style={styles.resendLink}>Resend Code</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    flexGrow: 1,
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
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  timerText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  content: {
    alignItems: 'center',
    paddingTop: 10,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#DBEAFE',
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
    textAlign: 'center',
  },
  emailHighlight: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
    marginBottom: 20,
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
    width: '100%',
  },
  errorText: {
    color: COLORS.rose,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  otpCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  otpLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 14,
  },
  otpInput: {
    width: '100%',
    height: 60,
    backgroundColor: COLORS.cardAlt,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 12,
    marginBottom: 14,
  },
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  demoPillText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  verifyBtn: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  verifyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  verifyText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
    marginRight: 6,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
  },
  resendText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  resendLink: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
  },
});
