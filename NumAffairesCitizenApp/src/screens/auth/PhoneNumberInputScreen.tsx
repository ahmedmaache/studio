// src/screens/auth/PhoneNumberInputScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { authService } from '../../api/authService'; // À décommenter plus tard

export default function PhoneNumberInputScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const navigation = useNavigation();

  const handleSendOTP = async () => {
    // setIsLoading(true);
    // if (!phoneNumber.trim()) {
    //   Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone.');
    //   setIsLoading(false);
    //   return;
    // }
    // const response = await authService.sendOTP(phoneNumber);
    // setIsLoading(false);
    // if (response.success) {
    //   navigation.navigate('OTP', { phoneNumber }); // Assurez-vous que 'OTP' est le nom de votre route OTP
    // } else {
    //   Alert.alert('Erreur', response.message || 'Impossible d_envoyer l_OTP.');
    // }
    Alert.alert('Info', 'Logique Send OTP à implémenter.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion Citoyen</Text>
      <Text style={styles.label}>Entrez votre numéro de téléphone :</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 05XXXXXXXX"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        autoComplete="tel"
      />
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Recevoir le code OTP" onPress={handleSendOTP} />
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
