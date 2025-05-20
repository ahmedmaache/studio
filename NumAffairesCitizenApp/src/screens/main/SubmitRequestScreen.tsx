
// src/screens/main/SubmitRequestScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { requestService, type CreateServiceRequestPayload } from '../../api/requestService';
import { useNavigation } from '@react-navigation/native';

export default function SubmitRequestScreen() {
  const { userToken } = useAuth();
  const navigation = useNavigation();

  const [requestType, setRequestType] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentsInput, setAttachmentsInput] = useState(''); // Comma-separated URLs
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);

    const attachmentsArray = attachmentsInput
      .split(',')
      .map(url => url.trim())
      .filter(url => url.length > 0 && (url.startsWith('http://') || url.startsWith('https://'))); // Basic URL validation

    const payload: CreateServiceRequestPayload = {
      requestType,
      description,
      attachments: attachmentsArray.length > 0 ? attachmentsArray : undefined,
    };

    const result = await requestService.createServiceRequest(payload, userToken);
    setIsLoading(false);

    if (result.success && result.data) {
      Alert.alert('Succès', `Votre demande a été soumise avec succès ! ID: ${result.data.id}`);
      setRequestType('');
      setDescription('');
      setAttachmentsInput('');
      navigation.goBack(); // Ou naviguez vers 'MyRequestsScreen'
    } else {
      Alert.alert('Erreur de soumission', result.error || 'Une erreur est survenue.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Soumettre une Nouvelle Demande</Text>

      <Text style={styles.label}>Type de demande <Text style={styles.required}>*</Text></Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Demande d'acte de naissance, Problème de voirie"
        value={requestType}
        onChangeText={setRequestType}
        editable={!isLoading}
      />

      <Text style={styles.label}>Description détaillée <Text style={styles.required}>*</Text></Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Décrivez votre demande le plus précisément possible."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={6}
        editable={!isLoading}
      />

      <Text style={styles.label}>Pièces jointes (Optionnel)</Text>
      <TextInput
        style={styles.input}
        placeholder="URLs des fichiers, séparées par des virgules"
        value={attachmentsInput}
        onChangeText={setAttachmentsInput}
        keyboardType="url"
        autoCapitalize="none"
        editable={!isLoading}
      />
      <Text style={styles.infoText}>Pour l'instant, veuillez entrer les URLs directes des fichiers. L'upload direct sera bientôt disponible.</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <View style={styles.buttonContainer}>
            <Button title="Soumettre la Demande" onPress={handleSubmit} disabled={isLoading} />
        </View>
      )}
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
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#495057',
  },
  required: {
    color: 'red',
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
  infoText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 20,
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
  buttonContainer: {
    marginTop: 10,
  }
});
