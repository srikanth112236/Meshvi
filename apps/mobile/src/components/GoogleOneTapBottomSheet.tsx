import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon } from './GoogleIcon';
import { launchGoogleOAuth } from '../services/googleAuth';
import { COLORS } from '../theme/colors';

interface GoogleOneTapBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Google account chooser sheet.
 *
 * Identity is always obtained from Google's real OAuth/ID-token flow — the app never
 * asks the user to type an email address and never fabricates a Google identity.
 */
export const GoogleOneTapBottomSheet: React.FC<GoogleOneTapBottomSheetProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { loginWithGoogle, loginWithToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!visible) return null;

  const handleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await launchGoogleOAuth({ promptSelectAccount: true });

      if (res?.cancelled) {
        return;
      }

      if (res?.type === 'native' && res.idToken) {
        const authRes = await loginWithGoogle({
          idToken: res.idToken,
          email: res.user?.email,
          displayName: res.user?.name,
          avatarUrl: res.user?.photo,
          googleId: res.user?.id,
        });
        if (!authRes.success) {
          throw new Error(authRes.error || 'Google authentication failed.');
        }
      } else if (res?.type === 'browser_session' && res.token) {
        await loginWithToken(res.token, res.user, res.refreshToken);
      } else {
        throw new Error('Google authentication did not complete. Please try again.');
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Unable to connect to Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetContainer}>
              <View style={styles.handleBar} />

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

              {error ? (
                <View style={styles.errorBox}>
                  <Feather name="alert-circle" size={14} color="#DC2626" style={{ marginRight: 6 }} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Text style={styles.description}>
                You will be taken to Google's secure account chooser. Choose the Google account you
                want to use for MESHVI.
              </Text>

              <TouchableOpacity
                style={[styles.continueBtn, loading && styles.continueBtnDisabled]}
                onPress={handleSignIn}
                disabled={loading}
                activeOpacity={0.88}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.continueBtnText}>Continue with Google</Text>
                    <Feather name="arrow-right" size={15} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  </>
                )}
              </TouchableOpacity>

              <Text style={styles.disclaimerText}>
                To continue, Google will share your name, email address, and language preference with
                MESHVI. See MESHVI's Privacy Policy and Terms of Service.
              </Text>
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
  description: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#5F6368',
    marginTop: 16,
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
});
