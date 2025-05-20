// src/screens/auth/OTPScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
// import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
// import { useAuth } from '../../contexts/AuthContext'; // À décommenter plus tard

// type OTPScreenRouteParams = {
//   OTP: { // Nom de la route tel que défini dans votre navigateur
//     phoneNumber: string;
//   };
// };

// type Props = {
//   route: RouteProp<OTPScreenRouteParams, 'OTP'>;
// };

export default function OTPScreen(/* { route }: Props */) {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const { phoneNumber } = route.params;
  // const { signIn } = useAuth(); // À décommenter
  // const navigation = useNavigation();

  const phoneNumber = "Numéro de test (placeholder)"; // À remplacer par route.params

  const handleVerifyOTP = async () => {
    // setIsLoading(true);
    // if (!otp.trim() || otp.length < 4) { // Ou la longueur de votre OTP
    //   Alert.alert('Erreur', 'Veuillez entrer un code OTP valide.');
    //   setIsLoading(false);
    //   return;
    // }
    // const result = await signIn(phoneNumber, otp); // signIn de AuthContext
    // setIsLoading(false);
    // if (!result.success) {
    //   Alert.alert('Erreur de connexion', result.message || 'Code OTP incorrect ou expiré.');
    // }
    // // Si succès, AppNavigator gérera la redirection vers MainStack
    Alert.alert('Info', 'Logique Verify OTP à implémenter.');
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
      />
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Vérifier le code" onPress={handleVerifyOTP} />
      )}
      {/* <Button title="Renvoyer le code" onPress={() => { /* Logique pour renvoyer OTP */ }} /> */}
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
