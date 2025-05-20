// src/screens/auth/OTPScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../contexts/AuthContext'; // Ajustez le chemin

// Types pour la navigation
type AuthStackParamList = {
  PhoneNumberInput: undefined;
  OTP: { phoneNumber: string };
};
type OTPScreenRouteProp = RouteProp<AuthStackParamList, 'OTP'>;
type OTPScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'OTP'>;


export default function OTPScreen() {
  const [otp, setOtp] = useState('');
  const { signIn, isLoading } = useAuth(); // Utilise isLoading du contexte
  const route = useRoute<OTPScreenRouteProp>();
  const navigation = useNavigation<OTPScreenNavigationProp>();
  
  const { phoneNumber } = route.params;

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length < 4) { // Ou la longueur de votre OTP
      Alert.alert('Erreur', 'Veuillez entrer un code OTP valide.');
      return;
    }
    
    const result = await signIn(phoneNumber, otp);
    
    if (result.success) {
      Alert.alert('Succès', result.message || 'Connexion réussie !');
      // AppNavigator gérera la redirection vers MainStack automatiquement grâce à la mise à jour de isAuthenticated
    } else {
      Alert.alert('Erreur de connexion', result.message || 'Code OTP incorrect ou expiré.');
    }
  };
  
  const handleResendOTP = async () => {
    // Implémentez la logique pour renvoyer l'OTP si nécessaire
    // Pourrait appeler une fonction de sendOTPForLogin de AuthContext à nouveau
    Alert.alert('Info', 'Logique pour renvoyer l_OTP à implémenter.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vérification OTP</Text>
      <Text style={styles.label}>
        Un code a été envoyé au <Text style={styles.phoneNumber}>{phoneNumber}</Text>.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Entrez le code OTP"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
        maxLength={6} // Si votre OTP a 6 chiffres
        editable={!isLoading}
      />
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{marginBottom: 20}} />
      ) : (
        <View>
            <Button title="Vérifier le code" onPress={handleVerifyOTP} disabled={isLoading} />
            {/* <Button title="Renvoyer le code" onPress={handleResendOTP} disabled={isLoading} color="#777" /> */}
            {/* Vous pouvez ajouter un bouton Renvoyer plus tard avec un timer */}
        </View>
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
    marginBottom: 10,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  phoneNumber: {
    fontWeight: 'bold',
    color: '#007AFF'
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
    textAlign: 'center',
  },
});
