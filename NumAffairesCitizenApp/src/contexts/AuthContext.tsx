// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../api/authService';

const CITIZEN_TOKEN_KEY = 'numAffairesCitizenAuthToken';
const CITIZEN_INFO_KEY = 'numAffairesCitizenAuthInfo';

export interface CitizenInfo {
  id: string;
  phoneNumber: string;
  name?: string | null;
  isVerified?: boolean;
  // Ajoutez d'autres champs si votre API les retourne
}

interface AuthContextType {
  userToken: string | null;
  userInfo: CitizenInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (phoneNumber: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  signOut: () => Promise<void>;
  sendOTPForLogin: (phoneNumber: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<CitizenInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      let token: string | null = null;
      let storedUserInfo: CitizenInfo | null = null;
      try {
        token = await SecureStore.getItemAsync(CITIZEN_TOKEN_KEY);
        const userInfoString = await SecureStore.getItemAsync(CITIZEN_INFO_KEY);
        if (userInfoString) {
          storedUserInfo = JSON.parse(userInfoString);
        }
      } catch (e) {
        console.error('Failed to load auth data from secure store', e);
      }
      setUserToken(token);
      setUserInfo(storedUserInfo);
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  const sendOTPForLogin = async (phoneNumber: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    const response = await authService.sendOTP(phoneNumber);
    setIsLoading(false);
    if (response.success) {
      return { success: true, message: response.message };
    } else {
      return { success: false, message: response.message || response.error || 'Failed to send OTP' };
    }
  };

  const signIn = async (phoneNumber: string, otp: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    const response = await authService.verifyOTP({ phoneNumber, otp });
    if (response.success && response.token && response.citizen) {
      setUserToken(response.token);
      setUserInfo(response.citizen);
      try {
        await SecureStore.setItemAsync(CITIZEN_TOKEN_KEY, response.token);
        await SecureStore.setItemAsync(CITIZEN_INFO_KEY, JSON.stringify(response.citizen));
      } catch (e) {
         console.error('Failed to save auth data to secure store', e);
         await signOutInternal(); // Forcer la déconnexion si la sauvegarde échoue
         setIsLoading(false);
         return { success: false, message: 'Failed to save session securely.' };
      }
      setIsLoading(false);
      return { success: true, message: response.message };
    } else {
      setIsLoading(false);
      return { success: false, message: response.message || response.error || 'Login failed' };
    }
  };

  const signOutInternal = async () => {
    setUserToken(null);
    setUserInfo(null);
    try {
      await SecureStore.deleteItemAsync(CITIZEN_TOKEN_KEY);
      await SecureStore.deleteItemAsync(CITIZEN_INFO_KEY);
    } catch (e) {
      console.error('Failed to remove auth data from secure store', e);
    }
  }

  const signOut = async () => {
    setIsLoading(true);
    await signOutInternal();
    setIsLoading(false);
  };

  const isAuthenticated = !!userToken;

  return (
    <AuthContext.Provider value={{ userToken, userInfo, isAuthenticated, isLoading, signIn, signOut, sendOTPForLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
