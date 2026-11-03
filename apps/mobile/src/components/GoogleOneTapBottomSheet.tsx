import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeStorage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon } from './GoogleIcon';
import { COLORS } from '../theme/colors';

const { width, height } = Dimensions.get('window');

interface GoogleOneTapBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onOpenBrowser?: () => void;
}

export const GoogleOneTapBottomSheet: React.FC<GoogleOneTapBottomSheetProps> = ({
  visible,
  onClose,
  onSuccess,
  onOpenBrowser,
}) => {
  const { loginWithGoogle } = useAuth();
  const [selectedEmail, setSelectedEmail] = useState('executive@gmail.com');
  const [selectedName, setSelectedName] = useState('Executive Decision Maker');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load remembered Google account on open
  useEffect(() => {
    if (!visible) return;
    setError('');
    setIsEditingAccount(false);

    async function loadLastAccount() {
      try {
        const saved = await SafeStorage.getItem('@meshvi_last_google_account');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.email) {
            setSelectedEmail(parsed.email);
            setSelectedName(parsed.displayName || parsed.email.split('@')[0]);
            setSelectedAvatar(parsed.avatarUrl || null);
            return;
          }
        }
      } catch {}
    }
    loadLastAccount();
  }, [visible]);

  if (!visible) return null;

  const handleSignIn = async (email: string, name: string) => {
    const finalEmail = email.trim().toLowerCase();
    if (!finalEmail || !finalEmail.includes('@')) {
      setError('Please provide a valid Google email address.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const finalName = name.trim() || finalEmail.split('@')[0];
      const res = await loginWithGoogle({
        email: finalEmail,
        displayName: finalName,
        avatarUrl: selectedAvatar || undefined,
        googleId: `google_${Date.now()}`,
      });

      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Failed to authenticate with Google.');
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const currentDisplayName = isEditingAccount
    ? customName || customEmail.split('@')[0] || 'User'
    : selectedName;
  const currentEmail = isEditingAccount ? customEmail : selectedEmail;
  const initial = (currentDisplayName[0] || 'G').toUpperCase();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetContainer}>
              {/* Drag Handle Indicator */}
              <View style={styles.handleBar} />

              {/* Google Brand Header */}
              <View style={styles.headerRow}>
                <View style={styles.brandGroup}>
                  <GoogleIcon size={24} style={{ marginRight: 10 }} />
                  <View>
                    <Text style={styles.sheetTitle}>Sign in with Google</Text>
                    <Text style={styles.sheetSubtitle}>to continue to MESHVI</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="x" size={18} color="#5F6368" />
                </TouchableOpacity>
              </View>

              {/* Error Notice */}
              {error ? (
                <View style={styles.errorBox}>
                  <Feather name="alert-circle" size={14} color="#DC2626" style={{ marginRight: 6 }} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Account Selection Card */}
              {!isEditingAccount ? (
                <View style={styles.accountCard}>
                  <View style={styles.avatarCircle}>
                    {selectedAvatar ? (
                      <Image source={{ uri: selectedAvatar }} style={styles.avatarImg} />
                    ) : (
                      <Text style={styles.avatarText}>{initial}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1, marginHorizontal: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.accountName} numberOfLines={1}>
                        {selectedName}
                      </Text>
                      <View style={styles.verifiedDot}>
                        <Feather name="check" size={8} color="#15803D" />
                      </View>
                    </View>
                    <Text style={styles.accountEmail} numberOfLines={1}>
                      {selectedEmail}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.switchAccountBtn}
                    onPress={() => {
                      setCustomEmail(selectedEmail);
                      setCustomName(selectedName);
                      setIsEditingAccount(true);
                    }}
                  >
                    <Text style={styles.switchAccountText}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.customInputBox}>
                  <Text style={styles.inputLabel}>Google Account Email</Text>
                  <TextInput
                    style={styles.inputField}
                    value={customEmail}
                    onChangeText={setCustomEmail}
                    placeholder="e.g. yourname@gmail.com"
                    placeholderTextColor="#9AA0A6"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  <Text style={[styles.inputLabel, { marginTop: 10 }]}>Display Name</Text>
                  <TextInput
                    style={styles.inputField}
                    value={customName}
                    onChangeText={setCustomName}
                    placeholder="e.g. John Doe"
                    placeholderTextColor="#9AA0A6"
                  />

                  <TouchableOpacity
                    style={styles.cancelCustomBtn}
                    onPress={() => setIsEditingAccount(false)}
                  >
                    <Text style={styles.cancelCustomText}>&larr; Back to saved account</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Primary 1-Tap Google Button */}
              <TouchableOpacity
                style={[styles.continueBtn, loading && styles.continueBtnDisabled]}
                onPress={() => handleSignIn(currentEmail, currentDisplayName)}
                disabled={loading}
                activeOpacity={0.88}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.continueBtnText}>
                      Continue as {currentDisplayName.split(' ')[0]}
                    </Text>
                    <Feather name="arrow-right" size={15} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  </>
                )}
              </TouchableOpacity>

              {/* Official Google Privacy Attestation */}
              <Text style={styles.disclaimerText}>
                To continue, Google will share your name, email address, and language preference with MESHVI. See MESHVI’s Privacy Policy and Terms of Service.
              </Text>

              {/* Optional Web Browser Link if needed */}
              {onOpenBrowser && (
                <TouchableOpacity
                  style={styles.browserFallbackLink}
                  onPress={() => {
                    onClose();
                    onOpenBrowser();
                  }}
                  activeOpacity={0.7}
                >
                  <Feather name="globe" size={12} color="#1A73E8" style={{ marginRight: 4 }} />
                  <Text style={styles.browserFallbackText}>Use external browser instead</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(32, 33, 36, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 24,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DADCE0',
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#202124',
    letterSpacing: -0.2,
  },
  sheetSubtitle: {
    fontSize: 11.5,
    color: '#5F6368',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F1F3F4',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    fontSize: 11.5,
    color: '#DC2626',
    flex: 1,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8EAED',
    marginTop: 14,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: 40,
    height: 40,
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  accountName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#202124',
  },
  verifiedDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  accountEmail: {
    fontSize: 11.5,
    color: '#5F6368',
    marginTop: 2,
  },
  switchAccountBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
  },
  switchAccountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A73E8',
  },
  customInputBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8EAED',
    marginTop: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3C4043',
    marginBottom: 4,
  },
  inputField: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12.5,
    color: '#202124',
  },
  cancelCustomBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  cancelCustomText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1A73E8',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A73E8',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 16,
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  continueBtnDisabled: {
    backgroundColor: '#8AB4F8',
  },
  continueBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },
  disclaimerText: {
    fontSize: 10,
    color: '#70757A',
    lineHeight: 14,
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  browserFallbackLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 4,
  },
  browserFallbackText: {
    fontSize: 11,
    color: '#1A73E8',
    fontWeight: '600',
  },
});
