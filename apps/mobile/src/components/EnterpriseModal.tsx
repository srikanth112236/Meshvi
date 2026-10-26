import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { MeshviColors } from '../theme/colors';

export type EnterpriseModalVariant = 'success' | 'warning' | 'error' | 'info' | 'confirm';

export interface EnterpriseModalProps {
  visible: boolean;
  variant?: EnterpriseModalVariant;
  title: string;
  message: string;
  badgeText?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const EnterpriseModal: React.FC<EnterpriseModalProps> = ({
  visible,
  variant = 'info',
  title,
  message,
  badgeText,
  confirmText = 'Understood',
  cancelText = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!visible) return null;

  const isDualAction = variant === 'confirm' || (cancelText && onCancel);

  // Variant Visual Theme Setup
  const getTheme = () => {
    switch (variant) {
      case 'success':
        return {
          iconName: 'check-circle' as const,
          iconFamily: 'feather' as const,
          iconColor: MeshviColors.accent,
          iconBg: MeshviColors.surfaceMint,
          borderColor: 'rgba(15, 118, 110, 0.25)',
          badgeBg: MeshviColors.surfaceMint,
          badgeColor: MeshviColors.accent,
          badgeDefault: 'ATTESTED & CONFIRMED',
          btnBg: MeshviColors.accent,
        };
      case 'warning':
        return {
          iconName: 'alert-triangle' as const,
          iconFamily: 'feather' as const,
          iconColor: '#D97706',
          iconBg: '#FEF3C7',
          borderColor: 'rgba(217, 119, 6, 0.25)',
          badgeBg: '#FEF3C7',
          badgeColor: '#D97706',
          badgeDefault: 'CLEARANCE NOTICE',
          btnBg: '#D97706',
        };
      case 'error':
        return {
          iconName: 'alert-octagon' as const,
          iconFamily: 'feather' as const,
          iconColor: '#DC2626',
          iconBg: '#FEE2E2',
          borderColor: 'rgba(220, 38, 38, 0.25)',
          badgeBg: '#FEE2E2',
          badgeColor: '#DC2626',
          badgeDefault: 'PROTOCOL EXCEPTION',
          btnBg: '#DC2626',
        };
      case 'confirm':
        return {
          iconName: isDestructive ? ('trash-2' as const) : ('shield' as const),
          iconFamily: 'feather' as const,
          iconColor: isDestructive ? '#DC2626' : MeshviColors.primary,
          iconBg: isDestructive ? '#FEE2E2' : MeshviColors.surfaceMuted,
          borderColor: isDestructive ? 'rgba(220, 38, 38, 0.25)' : MeshviColors.border,
          badgeBg: isDestructive ? '#FEE2E2' : MeshviColors.surfaceMuted,
          badgeColor: isDestructive ? '#DC2626' : MeshviColors.primary,
          badgeDefault: isDestructive ? 'IRREVERSIBLE ACTION' : 'CONFIDENTIAL CONFIRMATION',
          btnBg: isDestructive ? '#DC2626' : MeshviColors.accent,
        };
      case 'info':
      default:
        return {
          iconName: 'shield' as const,
          iconFamily: 'feather' as const,
          iconColor: MeshviColors.primary,
          iconBg: MeshviColors.surfaceMint,
          borderColor: 'rgba(15, 118, 110, 0.2)',
          badgeBg: MeshviColors.surfaceMint,
          badgeColor: MeshviColors.primary,
          badgeDefault: 'SYSTEM PROTOCOL',
          btnBg: MeshviColors.primary,
        };
    }
  };

  const theme = getTheme();
  const effectiveBadge = badgeText || theme.badgeDefault;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onCancel || onConfirm}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Top Accent Pill Indicator */}
              <View style={styles.topIndicatorRow}>
                <View style={styles.topIndicatorPill} />
              </View>

              {/* Icon Container with Glow Ring */}
              <View style={styles.iconRingWrap}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: theme.iconBg, borderColor: theme.borderColor },
                  ]}
                >
                  <Feather name={theme.iconName} size={28} color={theme.iconColor} />
                </View>
              </View>

              {/* Badge */}
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: theme.badgeBg }]}>
                  <Text style={[styles.badgeText, { color: theme.badgeColor }]}>
                    {effectiveBadge}
                  </Text>
                </View>
              </View>

              {/* Title & Description */}
              <Text style={styles.title}>{title}</Text>
              <ScrollView
                style={styles.messageScroll}
                contentContainerStyle={{ alignItems: 'center' }}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.message}>{message}</Text>
              </ScrollView>

              {/* Action Buttons */}
              {isDualAction ? (
                <View style={styles.dualBtnRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={onCancel}
                    activeOpacity={0.75}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.cancelBtnText}>{cancelText}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.confirmBtn,
                      { backgroundColor: isDestructive ? '#DC2626' : theme.btnBg },
                    ]}
                    onPress={onConfirm}
                    activeOpacity={0.88}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.confirmBtnText}>{confirmText}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.singleBtn, { backgroundColor: theme.btnBg }]}
                  onPress={onConfirm}
                  activeOpacity={0.88}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.singleBtnText}>{confirmText}</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(23, 43, 77, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: Math.min(width - 40, 390),
    maxHeight: '85%',
    backgroundColor: MeshviColors.surface,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 20,
  },
  topIndicatorRow: {
    alignItems: 'center',
    marginBottom: 10,
  },
  topIndicatorPill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: MeshviColors.border,
  },
  iconRingWrap: {
    marginBottom: 12,
  },
  iconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  title: {
    color: MeshviColors.textPrimary,
    fontSize: 16.5,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  messageScroll: {
    maxHeight: 180,
    marginBottom: 16,
    width: '100%',
  },
  message: {
    color: MeshviColors.textSecondary,
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  dualBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: MeshviColors.textSecondary,
    fontSize: 12.5,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  confirmBtnText: {
    color: MeshviColors.white,
    fontSize: 12.5,
    fontWeight: '800',
  },
  singleBtn: {
    width: '100%',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  singleBtnText: {
    color: MeshviColors.white,
    fontSize: 13,
    fontWeight: '800',
  },
});
