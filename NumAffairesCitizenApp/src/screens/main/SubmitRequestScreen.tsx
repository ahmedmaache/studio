import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext'; // Assuming AuthContext is in this path
import { createServiceRequest } from './requestService'; // Assuming requestService is in this path

interface CreateServiceRequestData {
  requestType: string;
  description: string;
  attachments?: string;
}

const SubmitRequestScreen: React.FC = () => {
  const { citizenToken } = useAuth();
  const [requestType, setRequestType] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!citizenToken) {
      Alert.alert('Erreur', 'Token citoyen non disponible. Veuillez vous reconnecter.');
      return;
    }

    setLoading(true);
    const requestData: CreateServiceRequestData = {
      requestType,
      description,
      attachments: attachments.split(',').map(url => url.trim()).filter(url => url.length > 0).join(','),
    };

    try {
      const response = await createServiceRequest(requestData, citizenToken);
      if (response.status === 'success') {
        Alert.alert('Succès', 'Votre demande a été soumise avec succès !');
        // Optionally clear the form
        setRequestType('');
        setDescription('');
        setAttachments('');
      } else {
        Alert.alert('Erreur', response.message || 'Échec de la soumission de la demande.');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue lors de la soumission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Soumettre une nouvelle demande</Text>

      <TextInput
        style={styles.input}
        placeholder="Type de demande"
        value={requestType}
        onChangeText={setRequestType}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description de la demande"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <TextInput
        style={styles.input}
        placeholder="URLs des pièces jointes (séparées par des virgules)"
        value={attachments}
        onChangeText={setAttachments}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Soumettre la demande" onPress={handleSubmit} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});

export default SubmitRequestScreen;