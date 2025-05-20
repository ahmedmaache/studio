// src/screens/main/SubmitRequestScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, Image, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { requestService } from '../../api/requestService';
import { pickImageAsync, takePhotoAsync, uploadImageWithSignedUrlAsync } from '../../services/fileUploadService';
import type * as ImagePicker from 'expo-image-picker'; // Importer les types

interface SelectedFile {
  id: string; // Unique ID for key in lists
  uri: string;
  asset: ImagePicker.ImagePickerAsset; // Store the full asset for more info
  isUploading: boolean;
  progress: number; // 0 to 1
  uploadedUrl?: string;
  error?: string;
}

export default function SubmitRequestScreen() {
  const { userToken } = useAuth();
  const [requestType, setRequestType] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const MAX_FILES = 5; // Limite le nombre de fichiers

  const addFileToSelection = (asset: ImagePicker.ImagePickerAsset) => {
     if (selectedFiles.length >= MAX_FILES) {
        Alert.alert("Limite atteinte", `Vous ne pouvez pas ajouter plus de ${MAX_FILES} fichiers.`);
        return;
     }
     setSelectedFiles(prevFiles => [
        ...prevFiles,
        {
          id: asset.assetId || Math.random().toString(36).substring(7), // assetId or random
          uri: asset.uri,
          asset: asset,
          isUploading: false,
          progress: 0,
        }
      ]);
  };

  const handleChooseImage = async () => {
    const result = await pickImageAsync();
    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Pour l'instant, expo-image-picker avec allowsMultipleSelection: false (par défaut) ne retourne qu'un asset
      addFileToSelection(result.assets[0]);
    }
  };

  const handleTakePhoto = async () => {
    const result = await takePhotoAsync();
    if (!result.canceled && result.assets && result.assets.length > 0) {
       addFileToSelection(result.assets[0]);
    }
  };
  
  const removeFile = (fileId: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleUploadSingleFile = async (fileId: string) => {
    const fileIndex = selectedFiles.findIndex(f => f.id === fileId);
    if (fileIndex === -1) return;

    const fileToUpload = selectedFiles[fileIndex];
    if (!fileToUpload || fileToUpload.isUploading || fileToUpload.uploadedUrl) return;
    
    if (!userToken) {
      Alert.alert("Erreur d'authentification", "Session utilisateur non trouvée. Veuillez vous reconnecter.");
      return;
    }

    setSelectedFiles(prev => 
      prev.map(f => 
        f.id === fileId ? { ...f, isUploading: true, progress: 0.01, error: undefined } : f
      )
    );

    try {
      const downloadURL = await uploadImageWithSignedUrlAsync(
        fileToUpload.uri,
        fileToUpload.asset.fileName, // Nom de fichier original de l'asset
        fileToUpload.asset.mimeType,  // Type MIME de l'asset
        userToken,
        (progressValue) => {
          setSelectedFiles(prev => 
            prev.map(f => 
              f.id === fileId ? { ...f, progress: progressValue } : f
            )
          );
        }
      );
      setSelectedFiles(prev => 
        prev.map(f => 
          f.id === fileId ? { ...f, isUploading: false, uploadedUrl: downloadURL, progress: 1 } : f
        )
      );
    } catch (e: any) {
      console.error("Upload error in screen:", e);
      setSelectedFiles(prev => 
        prev.map(f => 
          f.id === fileId ? { ...f, isUploading: false, error: e.message || "Échec de l'upload" } : f
        )
      );
      // Alert.alert("Erreur d'upload", e.message || "Impossible d'uploader le fichier.");
    }
  };

  const handleSubmit = async () => {
    if (!requestType.trim()) {
      Alert.alert('Erreur', 'Le type de demande est requis.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Erreur', 'La description est requise.');
      return;
    }
    if (!userToken) {
      Alert.alert('Erreur', 'Vous devez être connecté pour soumettre une demande.');
      return;
    }

    const filesStillUploading = selectedFiles.some(f => f.isUploading);
    if (filesStillUploading) {
      Alert.alert("Upload en cours", "Veuillez attendre la fin de tous les uploads de fichiers.");
      return;
    }

    const filesNotUploadedWithError = selectedFiles.filter(f => !f.uploadedUrl && f.error);
    if (filesNotUploadedWithError.length > 0) {
        Alert.alert("Échec d'uploads", "Certains fichiers n'ont pas pu être uploadés. Veuillez vérifier les erreurs ou les supprimer avant de soumettre.");
        return;
    }
    
    const filesNeedUploadAttempt = selectedFiles.filter(f => !f.uploadedUrl && !f.error);
    if (filesNeedUploadAttempt.length > 0) {
        Alert.alert("Fichiers en attente", `Veuillez cliquer sur "Uploader" pour chaque fichier (${filesNeedUploadAttempt.length} restant(s)) ou les supprimer.`);
        return;
    }
    
    setIsSubmittingForm(true);
    setFormError(null);
    setFormSuccess(null);

    const attachmentUrls = selectedFiles
      .filter(f => f.uploadedUrl)
      .map(f => f.uploadedUrl as string);

    const result = await requestService.createServiceRequest(
      { requestType, description, attachments: attachmentUrls },
      userToken
    );
    
    setIsSubmittingForm(false);

    if (result.success && result.data) {
        setFormSuccess('Demande soumise avec succès ! ID: ' + result.data.id);
        Alert.alert('Succès', 'Votre demande a été soumise avec succès.');
        setRequestType('');
        setDescription('');
        setSelectedFiles([]);
        // navigation.goBack(); // Optionnel : naviguer en arrière
    } else {
        setFormError(result.error || 'Une erreur est survenue lors de la soumission.');
        Alert.alert('Erreur de soumission', result.error || 'Une erreur est survenue.');
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Soumettre une Nouvelle Demande</Text>
      
      {formError && <Text style={styles.errorTextGlobal}>{formError}</Text>}
      {formSuccess && <Text style={styles.successTextGlobal}>{formSuccess}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Type de demande (ex: Problème de voirie)"
        value={requestType}
        onChangeText={setRequestType}
        editable={!isSubmittingForm}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description détaillée de votre demande"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={5}
        editable={!isSubmittingForm}
      />
      <Text style={styles.attachmentsTitle}>Pièces jointes (Optionnel, max {MAX_FILES})</Text>
      <View style={styles.buttonGroup}>
        <Button title="Choisir une Image" onPress={handleChooseImage} disabled={isSubmittingForm || selectedFiles.length >= MAX_FILES} />
        <Button title="Prendre une Photo" onPress={handleTakePhoto} disabled={isSubmittingForm || selectedFiles.length >= MAX_FILES} />
      </View>

      {selectedFiles.map((file) => (
        <View key={file.id} style={styles.filePreviewContainer}>
          <Image source={{ uri: file.uri }} style={styles.thumbnail} />
          <View style={styles.fileInfo}>
            <Text numberOfLines={1} style={styles.fileName}>
              {file.asset.fileName || file.uri.split('/').pop()}
            </Text>
            {file.isUploading && <Text style={styles.uploadingText}>Upload: {(file.progress * 100).toFixed(0)}%</Text>}
            {file.uploadedUrl && <Text style={styles.successTextSmall}>Prêt !</Text>}
            {file.error && <Text style={styles.errorTextSmall}>{file.error}</Text>}
          </View>
          <View style={styles.fileActions}>
            {!file.uploadedUrl && !file.isUploading && !file.error && (
              <TouchableOpacity style={styles.uploadButton} onPress={() => handleUploadSingleFile(file.id)}>
                <Text style={styles.uploadButtonText}>Uploader</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => removeFile(file.id)} style={styles.removeButton}>
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      
      <View style={styles.submitButtonContainer}>
        <Button 
          title="Soumettre la Demande" 
          onPress={handleSubmit} 
          disabled={isSubmittingForm || selectedFiles.some(f => f.isUploading)} 
        />
         {isSubmittingForm && <ActivityIndicator style={{marginTop:10}} size="large" color="#0000ff" />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f8f9fa',
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 25, 
    textAlign: 'center',
    color: '#333',
  },
  input: { 
    backgroundColor: 'white', 
    paddingHorizontal: 15, 
    paddingVertical: 12, 
    borderRadius: 8, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: '#ced4da', 
    fontSize: 16,
  },
  textArea: { 
    minHeight: 120, 
    textAlignVertical: 'top',
  },
  attachmentsTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#495057',
  },
  buttonGroup: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginBottom: 20,
  },
  filePreviewContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 10, 
    borderRadius: 8, 
    marginBottom: 12, 
    borderWidth:1, 
    borderColor: '#e9ecef',
    shadowColor: "#000",
    shadowOffset: { width: 0,	height: 1, },
    shadowOpacity: 0.10,
    shadowRadius: 1.00,
    elevation: 2,
  },
  thumbnail: { 
    width: 60, 
    height: 60, 
    marginRight: 12, 
    borderRadius: 6,
    backgroundColor: '#e9ecef',
  },
  fileInfo: { 
    flex: 1, 
    justifyContent: 'center',
  },
  fileName: { 
    fontSize: 14, 
    color: '#343a40',
    fontWeight: '500',
    marginBottom: 3,
  },
  uploadingText: {
    fontSize: 12,
    color: '#007bff',
  },
  fileActions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  uploadButton: {
    backgroundColor: '#28a745',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  removeButton: { 
    padding: 5,
  },
  removeButtonText: { 
    color: '#dc3545', 
    fontWeight: 'bold', 
    fontSize: 18,
  },
  errorTextSmall: { 
    color: '#dc3545', 
    fontSize: 12,
    marginTop: 2,
  },
  successTextSmall: { 
    color: '#28a745', 
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  submitButtonContainer: {
    marginTop: 25,
    marginBottom: 30,
  },
  errorTextGlobal: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 15,
  },
  successTextGlobal: {
    color: 'green',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 15,
  }
});
