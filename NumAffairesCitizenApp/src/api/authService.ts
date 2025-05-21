// src/api/authService.ts
// Remplacez par l'URL de base de votre backend Next.js en développement/production
// IMPORTANT: Pour les tests sur un appareil Android physique, localhost ne fonctionnera pas directement.
// Utilisez l'adresse IP de votre machine sur le réseau local (ex: http://192.168.1.X:9002)
// ou des outils comme ngrok pour exposer votre serveur local.
const API_BASE_URL = 'http://localhost:9002/api/citizen/auth';

interface SendOTPResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface VerifyOTPPayload {
  phoneNumber: string;
  otp: string;
}

interface CitizenInfo {
  id: string;
  phoneNumber: string;
  name?: string | null;
  isVerified?: boolean;
  // Ajoutez d'autres champs si votre API les retourne
}

interface VerifyOTPResponse {
  success: boolean;
  message?: string;
  token?: string;
  citizen?: CitizenInfo;
  error?: string;
}

export const authService = {
  sendOTP: async (phoneNumber: string): Promise<SendOTPResponse> => {
    try {
      console.log(`Sending OTP to: ${phoneNumber} via ${API_BASE_URL}/send-otp`);
      const response = await fetch(`${API_BASE_URL}/send-otp`, {
        method: 'POST', // Ajout de la méthode POST
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data: SendOTPResponse = await response.json();

      if (!response.ok || !data.success) {
        console.error('sendOTP API error:', data);
        // Assurer que success est false et que error ou message est propagé
        return { 
          success: false, 
          message: data.message, // L'API retourne soit message soit error
          error: data.error || 'Failed to send OTP from API' 
        };
      }
      // Assurer que success est true et que le message est propagé
      return { ...data, success: true };
    } catch (error) {
      console.error('sendOTP network error:', error);
      return { success: false, message: 'Network error or server is not reachable.', error: 'Network error or server is not reachable.' };
    }
  },

  verifyOTP: async (payload: VerifyOTPPayload): Promise<VerifyOTPResponse> => {
    try {
      console.log(`Verifying OTP for: ${payload.phoneNumber} via ${API_BASE_URL}/verify-otp`);
      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: 'POST', // Ajout de la méthode POST
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data: VerifyOTPResponse = await response.json();

      if (!response.ok || !data.success) {
        console.error('verifyOTP API error:', data);
        // Assurer que success est false et que error ou message est propagé
        return { 
          ...data, // Peut contenir token/citizen même si success est false selon l'API, mais on clarifie
          success: false, 
          message: data.message, 
          error: data.error || 'Failed to verify OTP from API'
        };
      }
      // data contient déjà success: true, token, citizen, message en cas de succès
      return data;
    } catch (error) {
      console.error('verifyOTP network error:', error);
      return { success: false, message: 'Network error or server is not reachable.', error: 'Network error or server is not reachable.' };
    }
  },
};
