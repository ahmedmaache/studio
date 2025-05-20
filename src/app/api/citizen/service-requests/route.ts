// src/app/api/citizen/service-requests/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyCitizenToken } from '@/lib/authUtils';
import { createServiceRequestCitizen, getMyServiceRequestsCitizen } from '@/lib/actions/serviceRequests';
import { z } from 'zod';

const createRequestSchema = z.object({
  requestType: z.string().min(3, "Request type is required and must be at least 3 characters."),
  description: z.string().min(10, "Description is required and must be at least 10 characters."),
  attachments: z.array(z.string().url("Each attachment must be a valid URL.")).optional(),
});

export async function POST(req: NextRequest) {
  const decodedToken = verifyCitizenToken(req);
  if (!decodedToken) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = createRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Invalid input.', details: validation.error.format() }, { status: 400 });
    }

    const { requestType, description, attachments } = validation.data;
    const result = await createServiceRequestCitizen(
      { requestType, description, attachments },
      decodedToken.citizenId
    );

    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error('POST /api/citizen/service-requests error:', error);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const decodedToken = verifyCitizenToken(req);
  if (!decodedToken) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1 || limit > 100) {
    return NextResponse.json({ success: false, error: 'Invalid pagination parameters.' }, { status: 400 });
  }

  try {
    const result = await getMyServiceRequestsCitizen(decodedToken.citizenId, { page, limit });
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error('GET /api/citizen/service-requests error:', error);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
