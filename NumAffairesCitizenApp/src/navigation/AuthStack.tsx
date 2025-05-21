// src/navigation/AuthStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PhoneNumberInputScreen from '../screens/auth/PhoneNumberInputScreen';
import OTPScreen from '../screens/auth/OTPScreen';
// import { View, Text } from 'react-native'; // Placeholder non plus nécessaire

const Stack = createStackNavigator();

// Placeholder Component (non plus utilisé, mais gardé pour référence si besoin)
// const PlaceholderScreen = ({ routeName }: { routeName: string }) => (
//   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//     <Text>{routeName} Screen (Placeholder)</Text>
//   </View>
// );


export default function AuthStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false // Cache l'en-tête par défaut pour les écrans d'auth
      }}
      initialRouteName="PhoneNumberInput" // Définit l'écran initial
    >
      <Stack.Screen 
        name="PhoneNumberInput" 
        component={PhoneNumberInputScreen} 
      />
      <Stack.Screen 
        name="OTP" 
        component={OTPScreen} 
      />
    </Stack.Navigator>
  );
}
