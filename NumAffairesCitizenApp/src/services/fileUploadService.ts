// src/services/fileUploadService.ts
import { app as firebaseApp } from '../config/firebase';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const NEXTJS_API_BASE_URL = 'http://localhost:9002/api/citizen'; // Adjust if necessary

interface SignedUrlBackendResponse {
  success: boolean;
  signedUrl?: string;
  filePath?: string;
  error?: string;
}

const getSignedUploadUrlFromBackend = async (
  originalFileName: string,
  contentType: string,
  citizenToken: string
): Promise<{ signedUrl: string; filePath: string }> => {
  try {
    console.log(`Requesting signed URL for: ${originalFileName}, type: ${contentType}`);
    const response = await fetch(`${NEXTJS_API_BASE_URL}/storage/generate-upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${citizenToken}`,
      },
      body: JSON.stringify({ fileName: originalFileName, contentType }),
    });

    const data: SignedUrlBackendResponse = await response.json();

    if (!response.ok || !data.success || !data.signedUrl || !data.filePath) {
      console.error('Backend error getting signed URL:', data);
      throw new Error(data.error || 'Failed to get signed upload URL from backend.');
    }
    console.log('Signed URL and filePath received:', data.signedUrl, data.filePath);
    return { signedUrl: data.signedUrl, filePath: data.filePath };
  } catch (error) {
    console.error('getSignedUploadUrlFromBackend fetch error:', error);
    throw error;
  }
};

export const uploadImageWithSignedUrlAsync = async (
  localFileUri: string,
  originalFileNameFromAsset: string | null | undefined,
  mimeTypeFromAsset: string | null | undefined,
  citizenToken: string,
  onProgress?: (progress: number) => void // Progress is 0 to 1
): Promise<string> => {
  console.log('Starting upload for local URI:', localFileUri);
  const response = await fetch(localFileUri);
  const blob = await response.blob();
  
  let originalFileName = originalFileNameFromAsset || localFileUri.split('/').pop() || `upload-${Date.now()}`;
  const contentType = mimeTypeFromAsset || blob.type || 'application/octet-stream';

  // Ensure filename has an extension if possible, especially if mimeType is generic
  if (contentType && contentType !== 'application/octet-stream' && !originalFileName.includes('.')) {
    const ext = contentType.split('/')[1];
    if (ext) {
      originalFileName += `.${ext}`;
    }
  }
  console.log(`File blob created. Name for backend: ${originalFileName}, Content-Type: ${contentType}`);

  const { signedUrl, filePath } = await getSignedUploadUrlFromBackend(
    originalFileName,
    contentType,
    citizenToken
  );

  if (onProgress) onProgress(0.1); // Indicate start of actual upload

  // Using XMLHttpRequest for progress tracking if onProgress is provided
  // Otherwise, a simple fetch. For simplicity, this example uses fetch.
  // If onProgress is vital, an XHR implementation is better.
  
  const uploadResponse = await fetch(signedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: blob,
  });

  if (onProgress) onProgress(1); // Indicate end

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error('Firebase Storage upload failed with signed URL:', uploadResponse.status, errorText);
    throw new Error(`Échec de l'upload vers Firebase Storage (${uploadResponse.status}).`);
  }

  const firebaseConfig = (firebaseApp.options as any);
  if (!firebaseConfig.storageBucket) {
    console.error("Firebase storageBucket configuration is missing in firebaseApp.options!");
    throw new Error("Firebase storageBucket configuration is missing.");
  }
  const publicDownloadURL = `https://storage.googleapis.com/${firebaseConfig.storageBucket}/${filePath}`;
  
  console.log('File uploaded successfully via signed URL. Public URL:', publicDownloadURL);
  return publicDownloadURL;
};

export const pickImageAsync = async (): Promise<ImagePicker.ImagePickerResult> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission Refusée', 'L_accès à la médiathèque est requis pour sélectionner une image.');
    return { canceled: true, assets: null };
  }
  return ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    // allowsEditing: true, // Optionnel
    // aspect: [4, 3],    // Optionnel
    quality: 0.7,      // Réduire la qualité pour des uploads plus rapides
    allowsMultipleSelection: false, // Changer à true si vous voulez gérer la sélection multiple directement ici
  });
};

export const takePhotoAsync = async (): Promise<ImagePicker.ImagePickerResult> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission Refusée', 'L_accès à la caméra est requis pour prendre une photo.');
        return { canceled: true, assets: null };
    }
    return ImagePicker.launchCameraAsync({
        // allowsEditing: true,
        // aspect: [4, 3],
        quality: 0.7,
    });
};
