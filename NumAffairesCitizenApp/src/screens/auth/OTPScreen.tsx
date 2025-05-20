// src/screens/auth/OTPScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../contexts/AuthContext'; // Ajustez le chemin

// Types pour la navigation
type AuthStackParamList = {
  PhoneNumberInput: undefined; // Assurez-vous que c'est défini
  OTP: { phoneNumber: string };
  // ... autres écrans
};
type OTPScreenRouteProp = RouteProp<AuthStackParamList, 'OTP'>;
// La navigation depuis cet écran pourrait aller vers PhoneNumberInput (en cas d'erreur) ou MainStack (implicitement via AuthContext)
type OTPScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'OTP'>;


export default function OTPScreen() {
  const [otp, setOtp] = useState('');
  const { signIn, isLoading, sendOTPForLogin } = useAuth(); // Utilise isLoading et signIn du contexte
  const route = useRoute<OTPScreenRouteProp>();
  const navigation = useNavigation<OTPScreenNavigationProp>(); // Pour la navigation si besoin (ex: retour)
  
  const { phoneNumber } = route.params;

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length < 4) { // Ou la longueur de votre OTP (6 chiffres?)
      Alert.alert('Erreur', 'Veuillez entrer un code OTP valide.');
      return;
    }
    
    const result = await signIn(phoneNumber, otp); // signIn gère la navigation implicite via AuthContext
    
    if (result.success) {
      // L'AppNavigator gérera la redirection vers MainStack
      // On pourrait afficher un message de succès ici si on le souhaite,
      // mais généralement, la redirection est suffisante.
      // Alert.alert('Succès', result.message || 'Connexion réussie !');
    } else {
      Alert.alert('Erreur de connexion', result.message || result.error || 'Code OTP incorrect ou expiré.');
    }
  };
  
  const handleResendOTP = async () => {
    Alert.alert('Renvoyer OTP', `Demande de renvoi de l'OTP pour ${phoneNumber}...`);
    const result = await sendOTPForLogin(phoneNumber); // Réutilise la fonction du AuthContext
    if (result.success) {
      Alert.alert('Succès', result.message || 'Un nouveau code OTP a été envoyé.');
    } else {
      Alert.alert('Erreur', result.message || result.error || 'Impossible de renvoyer l_OTP.');
    }
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
        keyboardType="number-pad" // number-pad est souvent mieux pour les OTPs
        value={otp}
        onChangeText={setOtp}
        maxLength={6} // Si votre OTP a 6 chiffres
        editable={!isLoading}
      />
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <View>
            <View style={styles.buttonContainer}>
                <Button title="Vérifier le code" onPress={handleVerifyOTP} disabled={isLoading} />
            </View>
            <View style={styles.buttonContainer}>
                <Button title="Renvoyer le code" onPress={handleResendOTP} disabled={isLoading} color="#777777" />
            </View>
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
    color: '#007AFF' // Couleur typique pour les liens/numéros
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
    textAlign: 'center', // Centrer le texte de l'OTP
  },
  loader: {
    marginBottom: 20, // Pour espacer le loader des boutons
  },
  buttonContainer: {
    marginBottom: 10, // Espacement entre les boutons
  }
});
