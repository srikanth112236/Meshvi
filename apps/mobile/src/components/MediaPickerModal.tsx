import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { MeshviColors } from '../theme/colors';
import { takeExecutivePhoto, pickImageFromGallery, ImageResult } from '../services/mediaService';

interface MediaPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (result: ImageResult) => void;
  title?: string;
  subtitle?: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  visible,
  onClose,
  onImageSelected,
  title = 'Identity Verification & Media',
  subtitle = 'Upload your executive portrait or corporate mandate document',
}) => {
  const handleCamera = async (isSelfie: boolean = true) => {
    onClose();
    const result = await takeExecutivePhoto(isSelfie);
    if (!result.cancelled) {
      onImageSelected(result);
    }
  };

  const handleGallery = async () => {
    onClose();
    const result = await pickImageFromGallery();
    if (!result.cancelled) {
      onImageSelected(result);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Drag Indicator */}
              <View style={styles.handle} />

              {/* Title & Subtitle */}
              <View style={styles.header}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="camera-account" size={26} color={MeshviColors.accent} />
                </View>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                {/* 1. Take Executive Selfie */}
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={() => handleCamera(true)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIconWrap, { backgroundColor: MeshviColors.surfaceMint }]}>
                    <Feather name="camera" size={20} color={MeshviColors.accent} />
                  </View>
                  <View style={styles.actionTextWrap}>
                    <Text style={styles.actionTitle}>Take Executive Selfie</Text>
                    <Text style={styles.actionDesc}>Front camera snapshot for instant biometric verification</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={MeshviColors.textMuted} />
                </TouchableOpacity>

                <View style={styles.divider} />

                {/* 2. Choose from Library */}
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={handleGallery}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIconWrap, { backgroundColor: '#EEF2FF' }]}>
                    <Feather name="image" size={20} color="#4F46E5" />
                  </View>
                  <View style={styles.actionTextWrap}>
                    <Text style={styles.actionTitle}>Choose from Photo Gallery</Text>
                    <Text style={styles.actionDesc}>Upload high-res corporate headshot or mandate document</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={MeshviColors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Permission Notice */}
              <View style={styles.securityNotice}>
                <Feather name="lock" size={12} color={MeshviColors.accent} style={{ marginRight: 6 }} />
                <Text style={styles.securityNoticeText}>
                  SOC-2 Type II encrypted • Images stored exclusively in private tenant vault
                </Text>
              </View>

              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: MeshviColors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: MeshviColors.surfaceMint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.2)',
  },
  title: {
    color: MeshviColors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: MeshviColors.textMuted,
    fontSize: 12.5,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  actionsContainer: {
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  actionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  actionTitle: {
    color: MeshviColors.textPrimary,
    fontSize: 14.5,
    fontWeight: '700',
  },
  actionDesc: {
    color: MeshviColors.textMuted,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  divider: {
    height: 1,
    backgroundColor: MeshviColors.border,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingHorizontal: 10,
  },
  securityNoticeText: {
    color: MeshviColors.accent,
    fontSize: 10.5,
    fontWeight: '700',
  },
  cancelButton: {
    marginTop: 16,
    backgroundColor: MeshviColors.surfaceMuted,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  cancelText: {
    color: MeshviColors.textPrimary,
    fontSize: 14.5,
    fontWeight: '700',
  },
});
