// src/contexts/AuthContext.tsx
// Ce fichier contiendra votre contexte d'authentification pour gérer l'état de connexion
// de l'utilisateur citoyen, le token JWT, etc.
// Exemple de structure (à remplir plus tard) :

// import React, { createContext, useState, useEffect, useContext } from 'react';
// import * as SecureStore from 'expo-secure-store';
// import { authService } from '../api/authService';

// interface AuthContextType {
//   userToken: string | null;
//   userInfo: any | null; // Définissez un type pour userInfo
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   signIn: (phoneNumber: string, otp: string) => Promise<boolean>;
//   signOut: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC = ({ children }) => {
//   // Logique pour charger le token, signIn, signOut...
//   return (
//     <AuthContext.Provider value={{ /* ...votre état et fonctions... */ }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

export {}; // Pour que le fichier ne soit pas vide et ne cause pas d'erreur TS
