// src/lib/authUtils.ts
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { type NextRequest } from 'next/server';

interface DecodedCitizenToken extends JwtPayload {
  citizenId: string;
  phoneNumber: string;
  // add other fields if you include them in the JWT
}

export function verifyCitizenToken(req: NextRequest): DecodedCitizenToken | null {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.CITIZEN_JWT_SECRET!) as DecodedCitizenToken;
    return decoded;
  } catch (error) {
    console.error('Invalid citizen token:', error);
    return null;
  }
}
