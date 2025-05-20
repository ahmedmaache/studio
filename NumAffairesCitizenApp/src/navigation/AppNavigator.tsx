// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
// import { useAuth } from '../contexts/AuthContext'; // À décommenter plus tard
// import AuthStack from './AuthStack';
// import MainStack from './MainStack';
import { View, Text, StyleSheet } from 'react-native'; // Placeholder

export default function AppNavigator() {
  // const { isAuthenticated, isLoading } = useAuth(); // À décommenter

  // if (isLoading) {
  //   return (
  //     <View style={styles.centered}>
  //       <Text>Chargement...</Text>
  //     </View>
  //   );
  // }

  return (
    <NavigationContainer>
      {/* {isAuthenticated ? <MainStack /> : <AuthStack />} */}
      {/* Placeholder pour l'instant */}
      <View style={styles.centered}>
        <Text>AppNavigator (Placeholder)</Text>
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
