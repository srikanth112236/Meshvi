import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export interface ImageResult {
  cancelled: boolean;
  uri?: string;
  base64?: string;
  width?: number;
  height?: number;
  type?: 'image' | 'video';
  error?: string;
}

/**
 * Request camera permissions with clean error handling
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
    return status === ImagePicker.PermissionStatus.GRANTED;
  } catch (err: any) {
    console.warn('Error requesting camera permission:', err);
    return false;
  }
}

/**
 * Request media library permissions
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === ImagePicker.PermissionStatus.GRANTED;
  } catch (err: any) {
    console.warn('Error requesting media library permission:', err);
    return false;
  }
}

/**
 * Capture an executive selfie or photo using the device camera
 */
export async function takeExecutivePhoto(isSelfie: boolean = true): Promise<ImageResult> {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    return {
      cancelled: true,
      error: 'Camera permission denied. Please enable camera access in your device settings to take an identity photo.',
    };
  }

  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
      cameraType: isSelfie ? ImagePicker.CameraType.front : ImagePicker.CameraType.back,
      base64: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { cancelled: true };
    }

    const asset = result.assets[0];
    return {
      cancelled: false,
      uri: asset.uri,
      base64: asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : undefined,
      width: asset.width,
      height: asset.height,
    };
  } catch (err: any) {
    console.warn('Error capturing photo:', err);
    return {
      cancelled: true,
      error: err.message || 'Failed to capture photo from camera.',
    };
  }
}

/**
 * Pick an image or corporate document from the photo library
 */
export async function pickImageFromGallery(): Promise<ImageResult> {
  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) {
    return {
      cancelled: true,
      error: 'Photo library access denied. Please enable photo access in settings to upload documents or avatars.',
    };
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
      base64: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { cancelled: true };
    }

    const asset = result.assets[0];
    return {
      cancelled: false,
      uri: asset.uri,
      base64: asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : undefined,
      width: asset.width,
      height: asset.height,
    };
  } catch (err: any) {
    console.warn('Error selecting image from library:', err);
    return {
      cancelled: true,
      error: err.message || 'Failed to select image from photo library.',
    };
  }
}
