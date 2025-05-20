// src/lib/actions/citizens.ts
'use server';

import prisma from '@/lib/prisma';
import type { NotificationSubscriptionPreference } from '@/types';

export async function manageCitizenPushToken(
  citizenId: string,
  pushToken: string,
  action: 'add' | 'remove'
): Promise<{ success: boolean; error?: string }> {
  try {
    const citizen = await prisma.citizen.findUnique({
      where: { id: citizenId },
      select: { pushTokens: true },
    });

    if (!citizen) {
      return { success: false, error: 'Citizen not found.' };
    }

    let updatedPushTokens = citizen.pushTokens || [];

    if (action === 'add') {
      if (!updatedPushTokens.includes(pushToken)) {
        updatedPushTokens.push(pushToken);
      }
    } else if (action === 'remove') {
      updatedPushTokens = updatedPushTokens.filter((token) => token !== pushToken);
    }

    await prisma.citizen.update({
      where: { id: citizenId },
      data: { pushTokens: updatedPushTokens },
    });

    return { success: true };
  } catch (error) {
    console.error(`Error ${action}ing push token for citizen ${citizenId}:`, error);
    return { success: false, error: `Failed to ${action} push token.` };
  }
}


export async function updateCitizenNotificationPreferences(
  citizenId: string,
  preferences: NotificationSubscriptionPreference[]
): Promise<{ success: boolean; error?: string; data?: any[] }> {
  try {
    const citizen = await prisma.citizen.findUnique({ where: { id: citizenId } });
    if (!citizen) {
      return { success: false, error: 'Citizen not found.' };
    }

    // Validate category names against availableCategories (optional but good practice)
    // For simplicity, this example assumes categoryName is valid.

    const results = await prisma.$transaction(
      preferences.map(pref => 
        prisma.notificationSubscription.upsert({
          where: { 
            citizenId_categoryName: { // Using the @@unique constraint
              citizenId: citizenId,
              categoryName: pref.categoryName,
            }
          },
          update: { isActive: pref.isActive },
          create: {
            citizenId: citizenId,
            categoryName: pref.categoryName,
            isActive: pref.isActive,
          },
        })
      )
    );

    return { success: true, data: results };
  } catch (error) {
    console.error(`Error updating notification preferences for citizen ${citizenId}:`, error);
    return { success: false, error: 'Failed to update notification preferences.' };
  }
}
