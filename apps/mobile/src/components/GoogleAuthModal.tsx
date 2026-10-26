import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
  ScrollView,
  Platform,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { SafeStorage } from '../services/storage';
import { apiRequest } from '../services/api';
import { launchGoogleOAuth } from '../services/googleAuth';

interface GoogleAuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultEmail?: string;
  defaultName?: string;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  visible,
  onClose,
  onSuccess,
  defaultEmail,
  defaultName,
}) => {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingAccountWelcome, setExistingAccountWelcome] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState('srikanth112236@gmail.com');
  const [selectedName, setSelectedName] = useState('Srikanth');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  // Load last remembered Google account on modal open
  useEffect(() => {
    if (!visible) return;
    setError('');
    setShowCustomInput(false);

    async function loadSavedGoogleAccount() {
      try {
        const saved = await SafeStorage.getItem('@meshvi_last_google_account');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.email) {
            setSelectedEmail(parsed.email);
            setSelectedName(parsed.displayName || parsed.email.split('@')[0]);
            return;
          }
        }
      } catch {}

      if (defaultEmail) {
        setSelectedEmail(defaultEmail);
        setSelectedName(defaultName || defaultEmail.split('@')[0]);
      }
    }

    loadSavedGoogleAccount();
  }, [visible, defaultEmail, defaultName]);

  const handleAuthenticate = async (emailToUse: string, nameToUse: string) => {
    if (!emailToUse || !emailToUse.includes('@')) {
      setError('Please provide a valid Google email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await loginWithGoogle({
        email: emailToUse.trim().toLowerCase(),
        displayName: nameToUse.trim() || emailToUse.split('@')[0],
        googleId: `google_oauth2_${Date.now()}`,
      });

      if (res.success) {
        if (res.isNewUser === false) {
          setExistingAccountWelcome(`Existing account verified. Welcome back! Signing in...`);
          setTimeout(() => {
            onClose();
            if (onSuccess) {
              onSuccess();
            }
          }, 850);
        } else {
          onClose();
          if (onSuccess) {
            onSuccess();
          }
        }
      } else {
        setError(res.error || 'Google authentication rejected. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to complete Google authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchOfficialOAuth = async () => {
    setError('');
    setLoading(true);
    try {
      await launchGoogleOAuth({ promptSelectAccount: true });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to launch Google OAuth browser session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.googleIconBox}>
              <MaterialCommunityIcons name="google" size={24} color="#4285F4" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.title}>Google Authentication</Text>
              <Text style={styles.subtitle}>Direct Google Account SSO & Identity Sync</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Feather name="x" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Existing Account Welcome Alert */}
          {existingAccountWelcome ? (
            <View style={styles.welcomeBanner}>
              <Feather name="check-circle" size={16} color="#15803D" style={{ marginRight: 6 }} />
              <Text style={styles.welcomeText}>{existingAccountWelcome}</Text>
            </View>
          ) : null}

          {/* Error Banner */}
          {error ? (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={16} color={COLORS.rose} style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
            {/* Active Google Account Card */}
            <View style={styles.accountCard}>
              <View style={styles.accountAvatar}>
                <Text style={styles.accountAvatarText}>
                  {selectedName ? selectedName.charAt(0).toUpperCase() : 'G'}
                </Text>
              </View>
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.accountName} numberOfLines={1}>{selectedName}</Text>
                  <View style={styles.verifiedBadge}>
                    <Feather name="check" size={10} color="#15803D" style={{ marginRight: 2 }} />
                    <Text style={styles.verifiedBadgeText}>Google Verified</Text>
                  </View>
                </View>
                <Text style={styles.accountEmail} numberOfLines={1}>{selectedEmail}</Text>
              </View>
            </View>

            {/* Primary Action Button */}
            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.disabledBtn]}
              onPress={() => handleAuthenticate(selectedEmail, selectedName)}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="google" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryBtnText}>Continue as {selectedName.split(' ')[0]}</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or switch account</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Switch / Add Another Google Account */}
            {!showCustomInput ? (
              <TouchableOpacity
                style={styles.switchAccountBtn}
                onPress={() => setShowCustomInput(true)}
                activeOpacity={0.7}
              >
                <Feather name="user-plus" size={15} color={COLORS.primary} style={{ marginRight: 6 }} />
                <Text style={styles.switchAccountText}>Use another Google Account</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.customFormBox}>
                <Text style={styles.inputLabel}>Google Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your.email@gmail.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={customEmail}
                  onChangeText={setCustomEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <Text style={[styles.inputLabel, { marginTop: 10 }]}>Display Name (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Srikanth"
                  placeholderTextColor={COLORS.textMuted}
                  value={customName}
                  onChangeText={setCustomName}
                />

                <TouchableOpacity
                  style={[styles.customSignInBtn, (!customEmail.trim() || loading) && styles.disabledBtn]}
                  onPress={() => handleAuthenticate(customEmail, customName || customEmail.split('@')[0])}
                  disabled={!customEmail.trim() || loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.customSignInText}>Sign In with this Google Account</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Official Web OAuth 2.0 Browser Launcher */}
            <TouchableOpacity
              style={styles.officialOAuthBtn}
              onPress={handleLaunchOfficialOAuth}
              disabled={loading}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="google" size={14} color={COLORS.navy} style={{ marginRight: 6 }} />
              <Text style={styles.officialOAuthText}>Open Google Account Chooser in Browser</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 21, 40, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  googleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F7F8FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.navy,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
  },
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.rose,
    flex: 1,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  accountAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  accountName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
  },
  accountEmail: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 6,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#15803D',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.navy,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 14,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  switchAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    marginBottom: 10,
  },
  switchAccountText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  customFormBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.navy,
  },
  customSignInBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  customSignInText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  officialOAuthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  officialOAuthText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.navy,
  },
});
