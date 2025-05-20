
// src/navigation/MainStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Importer les écrans
import MyRequestsScreen from '../screens/main/MyRequestsScreen';
import SubmitRequestScreen from '../screens/main/SubmitRequestScreen';
import RequestDetailScreen from '../screens/main/RequestDetailScreen';
// import ProfileScreen from '../screens/main/ProfileScreen'; // Placeholder pour un futur écran de profil

const Stack = createStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator 
      initialRouteName="MyRequestsScreen" // L'écran principal après connexion
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF', // Couleur d'en-tête exemple
        },
        headerTintColor: '#fff', // Couleur du texte de l'en-tête
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false, // Cache le titre du bouton retour sur iOS
      }}
    >
      <Stack.Screen 
        name="MyRequestsScreen" 
        component={MyRequestsScreen} 
        options={{ title: 'Mes Demandes' }} 
      />
      <Stack.Screen 
        name="SubmitRequestScreen" 
        component={SubmitRequestScreen} 
        options={{ title: 'Soumettre une Demande' }} 
      />
      <Stack.Screen 
        name="RequestDetailScreen" 
        component={RequestDetailScreen} 
        options={{ title: 'Détail de la Demande' }} 
      />
      {/* 
      <Stack.Screen 
        name="ProfileScreen" 
        component={ProfileScreen} 
        options={{ title: 'Mon Profil' }} 
      /> 
      */}
    </Stack.Navigator>
  );
}
