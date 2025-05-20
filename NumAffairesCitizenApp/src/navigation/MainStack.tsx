// src/navigation/MainStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
// import HomeScreen from '../screens/main/HomeScreen'; // Exemple
// import ProfileScreen from '../screens/main/ProfileScreen'; // Exemple
import { View, Text } from 'react-native'; // Placeholder

const Stack = createStackNavigator();

// Placeholder Component
const PlaceholderScreen = ({ routeName }: { routeName: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>{routeName} Screen (Placeholder)</Text>
  </View>
);

export default function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home">
         {() => <PlaceholderScreen routeName="Home" />}
      </Stack.Screen>
      <Stack.Screen name="Profile">
         {() => <PlaceholderScreen routeName="Profile" />}
      </Stack.Screen>
      {/* <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil' }} /> */}
      {/* <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mon Profil' }} /> */}
      {/* Ajoutez d'autres écrans principaux ici */}
    </Stack.Navigator>
  );
}
