// src/app/api/app/config/notification-categories/route.ts
import { NextResponse } from 'next/server';
import { availableCategories } from '@/types';
import type { Category } from '@/types';

export async function GET() {
  try {
    // Enrich categories with description if not already present (already done in types/index.ts based on previous prompt)
    const categoriesWithDetails: Category[] = availableCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || `Notifications concernant ${cat.name.toLowerCase()}.` // Default description
    }));
    return NextResponse.json({ success: true, data: categoriesWithDetails }, { status: 200 });
  } catch (error) {
    console.error('GET /api/app/config/notification-categories error:', error);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred while fetching notification categories.' }, { status: 500 });
  }
}
