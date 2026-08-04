import { Platform } from 'react-native';

/** Open a native/web file picker and return the selected file (web only today). */
export async function pickFile(accept: string): Promise<File | null> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return null;
  }
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.click();
  });
}

/** Trigger a browser download for a Blob (web only). */
export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof document === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function fileToFormData(file: File, fieldName = 'file'): FormData {
  const formData = new FormData();
  formData.append(fieldName, file);
  return formData;
}
