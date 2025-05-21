// src/app/api/citizen/service-requests/[requestId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyCitizenToken } from '@/lib/authUtils';
import { getMyServiceRequestDetailsCitizen } from '@/lib/actions/serviceRequests';

interface RouteContext {
  params: {
    requestId: string;
  };
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { requestId } = context.params;

  const decodedToken = verifyCitizenToken(req);
  if (!decodedToken) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!requestId) {
    return NextResponse.json({ success: false, error: 'Request ID is required.' }, { status: 400 });
  }

  try {
    const result = await getMyServiceRequestDetailsCitizen(decodedToken.citizenId, requestId);
    if (result.success) {
      if (!result.data) { // Should be handled by service action, but double check
        return NextResponse.json({ success: false, error: 'Service request not found or access denied.' }, { status: 404 });
      }
      return NextResponse.json(result, { status: 200 });
    } else if (result.error?.includes('not found or access denied')) {
      return NextResponse.json(result, { status: 404 });
    }
     else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error(`GET /api/citizen/service-requests/${requestId} error:`, error);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
