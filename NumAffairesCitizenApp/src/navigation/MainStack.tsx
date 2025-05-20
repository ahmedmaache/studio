// src/navigation/MainStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import the new screens
import SubmitRequestScreen from '../screens/main/SubmitRequestScreen';
import MyRequestsScreen from '../screens/main/MyRequestsScreen';
import RequestDetailScreen from '../screens/main/RequestDetailScreen';

const Stack = createStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator initialRouteName="MyRequests">
      <Stack.Screen name="MyRequests" component={MyRequestsScreen} options={{ title: 'Mes Demandes' }} />
      <Stack.Screen name="SubmitRequest" component={SubmitRequestScreen} options={{ title: 'Soumettre une Demande' }} />
      <Stack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ title: 'Détail de la Demande' }} />
    </Stack.Navigator>
  );
}
