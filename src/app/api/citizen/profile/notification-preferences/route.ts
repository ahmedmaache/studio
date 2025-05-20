// src/app/api/citizen/profile/notification-preferences/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyCitizenToken } from '@/lib/authUtils';
import { updateCitizenNotificationPreferences, getCitizenNotificationPreferences } from '@/lib/actions/citizens';
import { z } from 'zod';
import type { NotificationSubscriptionPreference } from '@/types';

const preferencesSchema = z.array(
  z.object({
    categoryName: z.string().min(1, "Category name is required."),
    isActive: z.boolean(),
  })
);

export async function PUT(req: NextRequest) {
  const decodedToken = verifyCitizenToken(req);
  if (!decodedToken) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const citizenId = decodedToken.citizenId;

  try {
    const body = await req.json();
    const validation = preferencesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Invalid input.', details: validation.error.format() }, { status: 400 });
    }

    const preferences: NotificationSubscriptionPreference[] = validation.data;
    const result = await updateCitizenNotificationPreferences(citizenId, preferences);

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Notification preferences updated successfully.', data: result.data }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, error: result.error || 'Failed to update preferences.' }, { status: result.error?.includes("Invalid category name") ? 400 : 500 });
    }
  } catch (error) {
    console.error('PUT /api/citizen/profile/notification-preferences error:', error);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred.' }, { status: 500 });
  }
}


export async function GET(req: NextRequest) {
  const decodedToken = verifyCitizenToken(req);
  if (!decodedToken) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const citizenId = decodedToken.citizenId;

  try {
    const result = await getCitizenNotificationPreferences(citizenId);
    if (result.success) {
      return NextResponse.json({ success: true, data: result.data }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, error: result.error || 'Failed to fetch preferences.' }, { status: 500 });
    }
  } catch (error) {
    console.error('GET /api/citizen/profile/notification-preferences error:', error);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred while fetching preferences.' }, { status: 500 });
  }
}
