// src/app/api/citizen/auth/verify-otp/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { CitizenVerifyOTPAndLogin } from '@/lib/actions/auth'; // Assurez-vous que le nom est correct
import { z } from 'zod';

const verifyOtpSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number is required."),
  otp: z.string().length(6, "OTP must be 6 digits."), // Supposons un OTP de 6 chiffres
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = verifyOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Invalid input.', details: validation.error.format() }, { status: 400 });
    }

    const { phoneNumber, otp } = validation.data;
    const result = await CitizenVerifyOTPAndLogin(phoneNumber, otp);

    if (result.success && result.token && result.citizen) {
      return NextResponse.json(
        { 
          success: true, 
          message: result.message || 'OTP verified successfully.',
          token: result.token,
          citizen: result.citizen 
        }, 
        { status: 200 }
      );
    } else {
      // Propager le message d'erreur spécifique et le statut HTTP approprié
      const statusCode = result.error?.includes("Invalid or expired OTP") || result.error?.includes("Citizen not found") ? 401 : 400;
      return NextResponse.json(
        { 
          success: false, 
          message: result.message, // Inclure le message pour le client
          error: result.error || 'Failed to verify OTP.' 
        }, 
        { status: statusCode }
      );
    }
  } catch (error) {
    console.error('POST /api/citizen/auth/verify-otp error:', error);
     if (error instanceof SyntaxError) {
        return NextResponse.json({ success: false, error: 'Invalid JSON payload.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
