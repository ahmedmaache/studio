// src/navigation/AuthStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
// import PhoneNumberInputScreen from '../screens/auth/PhoneNumberInputScreen';
// import OTPScreen from '../screens/auth/OTPScreen';
import { View, Text } from 'react-native'; // Placeholder

const Stack = createStackNavigator();

// Placeholder Component
const PlaceholderScreen = ({ routeName }: { routeName: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>{routeName} Screen (Placeholder)</Text>
  </View>
);


export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PhoneNumberInput">
        {() => <PlaceholderScreen routeName="PhoneNumberInput" />}
      </Stack.Screen>
      <Stack.Screen name="OTP">
        {() => <PlaceholderScreen routeName="OTP" />}
      </Stack.Screen>
      {/* <Stack.Screen name="PhoneNumberInput" component={PhoneNumberInputScreen} /> */}
      {/* <Stack.Screen name="OTP" component={OTPScreen} /> */}
    </Stack.Navigator>
  );
}
