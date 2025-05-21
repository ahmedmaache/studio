// src/screens/auth/PhoneNumberInputScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../contexts/AuthContext'; // Ajustez le chemin

// Définissez les types pour votre AuthStack si ce n'est pas déjà fait
// Ceci devrait correspondre à ce qui est défini dans AuthStack.tsx
type AuthStackParamList = {
  PhoneNumberInput: undefined;
  OTP: { phoneNumber: string };
  // ... autres écrans d'authentification si vous en avez
};

// Type pour la prop de navigation de cet écran
type PhoneNumberInputScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'PhoneNumberInput'>;

export default function PhoneNumberInputScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const { sendOTPForLogin, isLoading } = useAuth(); // Utilise isLoading et sendOTPForLogin du contexte
  const navigation = useNavigation<PhoneNumberInputScreenNavigationProp>();

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone.');
      return;
    }
    // Vous pouvez ajouter une validation plus poussée du numéro ici
    // ex: if (!/^\d{10}$/.test(phoneNumber.replace(/\s/g, ''))) { Alert.alert('Erreur', 'Numéro de téléphone invalide.'); return; }

    const result = await sendOTPForLogin(phoneNumber);

    if (result.success) {
      Alert.alert('Succès', result.message || 'OTP envoyé. Veuillez vérifier vos messages.');
      navigation.navigate('OTP', { phoneNumber });
    } else {
      Alert.alert('Erreur', result.message || result.error || 'Impossible d_envoyer l_OTP.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion Citoyen</Text>
      <Text style={styles.label}>Entrez votre numéro de téléphone :</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 05XXXXXXXX" // Adaptez le placeholder à votre format local
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        autoComplete="tel"
        editable={!isLoading}
      />
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Recevoir le code OTP" onPress={handleSendOTP} disabled={isLoading} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 18,
  },
});
