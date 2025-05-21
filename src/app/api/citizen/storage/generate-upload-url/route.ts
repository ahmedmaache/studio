// src/app/api/citizen/storage/generate-upload-url/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyCitizenToken } from '@/lib/authUtils';
import { generateSignedUploadUrlForCitizen } from '@/lib/actions/storage';
import { z } from 'zod';

const generateUrlSchema = z.object({
  fileName: z.string().min(1, "File name is required."),
  contentType: z.string().min(1, "Content type is required."),
});

export async function POST(req: NextRequest) {
  const decodedToken = verifyCitizenToken(req);
  if (!decodedToken) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const citizenId = decodedToken.citizenId;

  try {
    const body = await req.json();
    const validation = generateUrlSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Invalid input.', details: validation.error.format() }, { status: 400 });
    }

    const { fileName, contentType } = validation.data;
    const result = await generateSignedUploadUrlForCitizen(citizenId, fileName, contentType);

    if (result.success && result.signedUrl && result.filePath) {
      return NextResponse.json(
        { 
          success: true, 
          signedUrl: result.signedUrl,
          filePath: result.filePath
        }, 
        { status: 200 }
      );
    } else {
      return NextResponse.json({ success: false, error: result.error || 'Failed to generate signed URL.' }, { status: 500 });
    }
  } catch (error) {
    console.error('POST /api/citizen/storage/generate-upload-url error:', error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ success: false, error: 'Invalid JSON payload.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
