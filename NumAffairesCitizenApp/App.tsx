import React from 'react';
import { StatusBar } from 'expo-status-bar';
// import { AuthProvider } from './src/contexts/AuthContext'; // À décommenter plus tard
// import AppNavigator from './src/navigation/AppNavigator'; // À décommenter plus tard
import { Text, View, StyleSheet } from 'react-native'; // Placeholder initial

export default function App() {
  // Pour l'instant, un simple placeholder.
  // Vous décommenterez et utiliserez AuthProvider et AppNavigator ici.
  return (
    <View style={styles.container}>
      <Text>NumAffaires Citizen App - Initialisation</Text>
      <StatusBar style="auto" />
    </View>
    // <AuthProvider>
    //   <AppNavigator />
    //   <StatusBar style="auto" />
    // </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
