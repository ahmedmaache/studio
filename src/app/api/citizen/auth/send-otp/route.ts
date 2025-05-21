// src/app/api/citizen/auth/send-otp/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { CitizenRegisterSendOTP } from '@/lib/actions/auth'; // Assurez-vous que le nom de la fonction est correct
import { z } from 'zod';

const sendOtpSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number is required and must be at least 10 digits."), // Validation simple
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = sendOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Invalid input.', details: validation.error.format() }, { status: 400 });
    }

    const { phoneNumber } = validation.data;
    const result = await CitizenRegisterSendOTP(phoneNumber);

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message || 'OTP sent successfully.' }, { status: 200 });
    } else {
      // Propager le message d'erreur spécifique de l'action si disponible
      return NextResponse.json({ success: false, message: result.message, error: result.error || 'Failed to send OTP.' }, { status: 400 });
    }
  } catch (error) {
    console.error('POST /api/citizen/auth/send-otp error:', error);
    // Distinguer l'erreur de parsing JSON d'autres erreurs
    if (error instanceof SyntaxError) {
        return NextResponse.json({ success: false, error: 'Invalid JSON payload.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
