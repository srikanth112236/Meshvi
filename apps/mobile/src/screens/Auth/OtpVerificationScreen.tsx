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
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

interface OtpVerificationScreenProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

export const OtpVerificationScreen: React.FC<OtpVerificationScreenProps> = ({
  email,
  onSuccess,
  onBack,
}) => {
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
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* TOP GRADIENT HEADER */}
      <LinearGradient
        colors={['#071120', '#0B1D3A', '#0284C7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: Math.max(insets.top, 20) + 8 }]}
      >
        <View style={styles.topNavRow}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backCircleBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="chevron-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.timerPill}>
            <Feather name="clock" size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
            <Text style={styles.timerText}>{formatTimer(secondsLeft)}</Text>
          </View>
        </View>

        <View style={styles.brandTitleContainer}>
          <Text style={styles.brandTitle}>Meshvi</Text>
          <Text style={styles.brandSubtitle}>Two-Factor Security Clearance</Text>
        </View>
      </LinearGradient>

      {/* BOTTOM WHITE CARD */}
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
          <View style={[styles.mainCard, { paddingBottom: Math.max(insets.bottom, 20) + 24 }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Verify Your Email</Text>
              <Text style={styles.cardSubtitle}>
                Enter the 6-digit verification code dispatched to:
              </Text>
              <Text style={styles.emailHighlight}>{email || 'your-email@company.com'}</Text>
            </View>

            {error ? (
              <View style={styles.errorBanner}>
                <Feather name="alert-circle" size={15} color={COLORS.rose} style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* OTP Input Card */}
            <View style={styles.otpBox}>
              <Text style={styles.otpLabel}>6-DIGIT VERIFICATION CODE</Text>
              <TextInput
                style={styles.otpInput}
                value={otp}
                onChangeText={(txt) => setOtp(txt.replace(/[^0-9]/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="• • • • • •"
                placeholderTextColor="#94A3B8"
                autoFocus
              />

              {/* Demo Auto-fill */}
              <TouchableOpacity
                style={styles.demoFillBtn}
                onPress={() => setOtp('123456')}
                activeOpacity={0.7}
              >
                <Feather name="zap" size={12} color="#0284C7" style={{ marginRight: 4 }} />
                <Text style={styles.demoFillText}>Auto-fill test code (123456)</Text>
              </TouchableOpacity>
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              onPress={handleVerify}
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
                  <Text style={styles.submitBtnText}>Verify & Enter Hub</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  timerText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
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
    paddingTop: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
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
    marginTop: 6,
    textAlign: 'center',
  },
  emailHighlight: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0284C7',
    marginTop: 4,
    textAlign: 'center',
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
  otpBox: {
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  otpLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 12,
  },
  otpInput: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 8,
    textAlign: 'center',
    paddingVertical: 8,
    width: '100%',
  },
  demoFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  demoFillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  submitBtnWrapper: {
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
});
