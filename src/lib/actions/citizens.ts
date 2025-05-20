// src/lib/actions/citizens.ts
'use server';

import prisma from '@/lib/prisma';
import type { NotificationSubscriptionPreference } from '@/types';
import { availableCategories } from '@/types'; // Import availableCategories

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

    // Validate category names against availableCategories
    const validCategoryNames = availableCategories.map(c => c.name);
    for (const pref of preferences) {
        if (!validCategoryNames.includes(pref.categoryName)) {
            return { success: false, error: `Invalid category name: ${pref.categoryName}` };
        }
    }

    const results = await prisma.$transaction(
      preferences.map(pref => 
        prisma.notificationSubscription.upsert({
          where: { 
            citizenId_categoryName: { 
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

export async function getCitizenNotificationPreferences(
  citizenId: string
): Promise<{ success: boolean; error?: string; data?: NotificationSubscriptionPreference[] }> {
  try {
    const citizen = await prisma.citizen.findUnique({ where: { id: citizenId } });
    if (!citizen) {
      return { success: false, error: 'Citizen not found.' };
    }

    const subscriptions = await prisma.notificationSubscription.findMany({
      where: { citizenId: citizenId },
      select: { categoryName: true, isActive: true },
    });

    // Map subscriptions to a dictionary for quick lookup
    const activeSubscriptionsMap = new Map<string, boolean>();
    subscriptions.forEach(sub => {
      activeSubscriptionsMap.set(sub.categoryName, sub.isActive);
    });

    // Create a full list of preferences based on all available categories
    const allPreferences: NotificationSubscriptionPreference[] = availableCategories.map(category => ({
      categoryName: category.name,
      isActive: activeSubscriptionsMap.get(category.name) || false, // Default to false if no explicit subscription
    }));

    return { success: true, data: allPreferences };
  } catch (error) {
    console.error(`Error fetching notification preferences for citizen ${citizenId}:`, error);
    return { success: false, error: 'Failed to fetch notification preferences.' };
  }
}
