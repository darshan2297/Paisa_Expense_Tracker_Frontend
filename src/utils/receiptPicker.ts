import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export type PickedReceipt = {
  uri: string;
  name: string;
  mimeType: string;
};

async function ensureLibraryPermission(): Promise<boolean> {
  const current = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (current.granted) return true;
  const asked = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return asked.granted;
}

async function ensureCameraPermission(): Promise<boolean> {
  const current = await ImagePicker.getCameraPermissionsAsync();
  if (current.granted) return true;
  const asked = await ImagePicker.requestCameraPermissionsAsync();
  return asked.granted;
}

function toReceipt(asset: ImagePicker.ImagePickerAsset): PickedReceipt {
  const mimeType = asset.mimeType ?? 'image/jpeg';
  const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
  return {
    uri: asset.uri,
    name: asset.fileName ?? `receipt.${ext}`,
    mimeType,
  };
}

/** Open gallery / files to pick a receipt image. */
export async function pickReceiptFromLibrary(): Promise<PickedReceipt | null> {
  const ok = await ensureLibraryPermission();
  if (!ok) {
    Alert.alert('Permission needed', 'Allow photo library access to attach a receipt.');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.85,
    allowsEditing: false,
  });
  if (result.canceled || !result.assets[0]) return null;
  return toReceipt(result.assets[0]);
}

/** Take a photo with the device camera (mobile / webcam on some browsers). */
export async function pickReceiptFromCamera(): Promise<PickedReceipt | null> {
  const ok = await ensureCameraPermission();
  if (!ok) {
    Alert.alert('Permission needed', 'Allow camera access to photograph a receipt.');
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.85,
    allowsEditing: false,
  });
  if (result.canceled || !result.assets[0]) return null;
  return toReceipt(result.assets[0]);
}

/** Prompt the user to choose Camera or Gallery. */
export function pickReceiptWithPrompt(): Promise<PickedReceipt | null> {
  return new Promise((resolve) => {
    if (Platform.OS === 'web') {
      // Web Alert buttons are limited — open library (file picker) directly.
      void pickReceiptFromLibrary().then(resolve);
      return;
    }
    Alert.alert('Attach receipt', 'Take a photo or choose an existing image.', [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
      {
        text: 'Camera',
        onPress: () => {
          void pickReceiptFromCamera().then(resolve);
        },
      },
      {
        text: 'Gallery',
        onPress: () => {
          void pickReceiptFromLibrary().then(resolve);
        },
      },
    ]);
  });
}
