// src/lib/actions/communication.ts
'use server';

import prisma from '@/lib/prisma';
import { firebaseAdminApp } from '@/lib/firebaseAdmin';
import { getMessaging } from 'firebase-admin/messaging';
import { manageCitizenPushToken } from '@/lib/actions/citizens'; // To clean up tokens
import type { CommunicationLog, CommunicationStatus as PrismaCommStatus } from '@prisma/client';
import type { CommunicationStatus } from '@/types'; // Your frontend/shared type


interface SendCommunicationParams {
  messageContent: string;
  channels: {
    sms?: boolean;
    push?: boolean;
    whatsapp?: boolean;
  };
  targetCategories: string[]; // Array of category names
  adminId: string; // ID of the admin initiating the communication
  scheduledAt?: Date | null;
}

export async function processAndSendCommunication(
  params: SendCommunicationParams
): Promise<{ success: boolean; message: string; logId?: string; details?: any }> {
  const { messageContent, channels, targetCategories, adminId, scheduledAt } = params;

  let finalStatus: PrismaCommStatus = 'PENDING';
  let fcmDetails = {
    messageIds: [] as string[],
    successCount: 0,
    failureCount: 0,
    failureReason: null as string | null,
  };
  
  let targetedCitizenIds: string[] = [];

  // If scheduling, set status to SCHEDULED and return for now.
  // A separate worker/cron job would pick up scheduled communications.
  if (scheduledAt && scheduledAt > new Date()) {
    finalStatus = 'SCHEDULED';
    try {
      const log = await prisma.communicationLog.create({
        data: {
          messageContent,
          channels: channels as any, // Prisma expects Json
          targetAudienceCategories: targetCategories,
          targetCitizenIds: [], // Not yet determined for scheduled
          status: finalStatus,
          scheduledAt,
          adminId,
        },
      });
      return { success: true, message: 'Communication scheduled successfully.', logId: log.id };
    } catch (error) {
      console.error('Error creating scheduled communication log:', error);
      return { success: false, message: 'Failed to schedule communication.' };
    }
  }


  // 1. Fetch targeted citizens based on preferences for the given categories
  let citizensToNotify: { id: string, pushTokens: string[] }[] = [];
  if (channels.push && targetCategories.length > 0) {
    try {
      citizensToNotify = await prisma.citizen.findMany({
        where: {
          AND: [
            {
              pushTokens: {
                isEmpty: false, // Has at least one push token
              },
            },
            {
              notificationSubscriptions: {
                some: {
                  categoryName: { in: targetCategories },
                  isActive: true,
                },
              },
            },
          ],
        },
        select: {
          id: true,
          pushTokens: true,
        },
      });
      targetedCitizenIds = citizensToNotify.map(c => c.id);
      console.log(`Found ${citizensToNotify.length} citizens subscribed to categories: ${targetCategories.join(', ')} with push tokens.`);

    } catch (dbError) {
        console.error('Error fetching citizens for FCM:', dbError);
        fcmDetails.failureReason = 'Database error fetching target citizens for FCM.';
        // Continue to log, but FCM part will likely fail or target no one
    }
  } else if (channels.push) {
     console.log('Push channel selected but no target categories specified. No FCM will be sent.');
     fcmDetails.failureReason = 'No target categories for FCM.';
  }


  // 2. Process Push Notifications (FCM) if selected
  if (channels.push && citizensToNotify.length > 0) {
    const allPushTokens = citizensToNotify.reduce((acc, citizen) => {
      if (citizen.pushTokens && citizen.pushTokens.length > 0) {
        acc.push(...citizen.pushTokens);
      }
      return acc;
    }, [] as string[]);

    const uniquePushTokens = [...new Set(allPushTokens)]; // Remove duplicate tokens if any

    if (uniquePushTokens.length > 0) {
      console.log(`Sending FCM to ${uniquePushTokens.length} unique tokens.`);
      const messagePayload = {
        notification: {
          title: 'Nouvelle Communication de WilayaConnect',
          body: messageContent.substring(0, 240) + (messageContent.length > 240 ? '...' : ''), // FCM body limit
        },
        // data: { type: 'communication', categories: targetCategories.join(',') }, // Optional data payload
      };

      try {
        const response = await getMessaging(firebaseAdminApp).sendToDevice(uniquePushTokens, messagePayload, {
          // Required for background messages on iOS
          // contentAvailable: true,
          // Required for background messages on Android (though 'notification' payload often handles it)
          priority: 'high',
        });

        fcmDetails.successCount = response.successCount;
        fcmDetails.failureCount = response.failureCount;

        response.results.forEach((result, index) => {
          const token = uniquePushTokens[index];
          if (result.messageId) {
            fcmDetails.messageIds.push(result.messageId);
          }
          if (result.error) {
            console.warn(`Failed to send FCM to token ${token}:`, result.error);
            // Handle token cleanup for specific errors
            if (
              result.error.code === 'messaging/registration-token-not-registered' ||
              result.error.code === 'messaging/invalid-registration-token'
            ) {
              const citizenWithThisToken = citizensToNotify.find(c => c.pushTokens.includes(token));
              if (citizenWithThisToken) {
                manageCitizenPushToken(citizenWithThisToken.id, token, 'remove')
                  .then(() => console.log(`Cleaned up invalid token: ${token}`))
                  .catch(e => console.error(`Failed to cleanup token ${token}:`, e));
              }
            }
          }
        });
        
        if (fcmDetails.failureCount > 0 && fcmDetails.successCount > 0) {
            finalStatus = 'PARTIALLY_FAILED';
            fcmDetails.failureReason = `${fcmDetails.failureCount} FCM notifications failed.`;
        } else if (fcmDetails.failureCount > 0 && fcmDetails.successCount === 0) {
            finalStatus = 'FAILED';
            fcmDetails.failureReason = 'All FCM notifications failed.';
        } else if (fcmDetails.successCount > 0 ) {
            finalStatus = 'SENT'; // Can be overridden by other channels
        }
        console.log(`FCM Results: ${fcmDetails.successCount} sent, ${fcmDetails.failureCount} failed.`);

      } catch (fcmError: any) {
        console.error('Error sending FCM messages:', fcmError);
        finalStatus = 'FAILED';
        fcmDetails.failureReason = fcmError.message || 'General FCM sending error.';
        fcmDetails.failureCount = uniquePushTokens.length; // Assume all failed if global error
      }
    } else {
      console.log('No valid push tokens found for the targeted citizens.');
       if (channels.push) fcmDetails.failureReason = 'No valid push tokens for targeted citizens.';
    }
  }

  // 3. Process SMS (Simulated)
  if (channels.sms) {
    console.log(`SIMULATED SMS: Targeting categories [${targetCategories.join(', ')}]. Message: "${messageContent}"`);
    // In a real scenario, you'd fetch phone numbers for targeted citizens and send via SMS API.
    // For now, if FCM was not the only channel and it was not FAILED, status can be SENT.
    if (finalStatus !== 'FAILED' && finalStatus !== 'PARTIALLY_FAILED') finalStatus = 'SENT';
  }

  // 4. Process WhatsApp (Simulated)
  if (channels.whatsapp) {
    console.log(`SIMULATED WhatsApp: Targeting categories [${targetCategories.join(', ')}]. Message: "${messageContent}"`);
    if (finalStatus !== 'FAILED' && finalStatus !== 'PARTIALLY_FAILED') finalStatus = 'SENT';
  }

  // If no push channel was selected, and SMS/WhatsApp are just simulated, mark as SENT for logging.
  if (!channels.push && (channels.sms || channels.whatsapp) && finalStatus === 'PENDING') {
      finalStatus = 'SENT';
  }


  // 5. Log the communication attempt
  try {
    const log = await prisma.communicationLog.create({
      data: {
        messageContent,
        channels: channels as any, // Prisma expects Json
        targetAudienceCategories: targetCategories,
        targetCitizenIds: targetedCitizenIds,
        status: finalStatus,
        sentAt: ['SENT', 'PARTIALLY_FAILED'].includes(finalStatus) ? new Date() : null,
        adminId,
        fcmMessageIds: fcmDetails.messageIds,
        fcmSuccessCount: fcmDetails.successCount,
        fcmFailureCount: fcmDetails.failureCount,
        failureReason: fcmDetails.failureReason
      },
    });
    let successMessage = `Communication processed. Status: ${finalStatus}.`;
    if (channels.push) {
        successMessage += ` FCM: ${fcmDetails.successCount} sent, ${fcmDetails.failureCount} failed.`
    }
    return { success: true, message: successMessage, logId: log.id, details: fcmDetails };
  } catch (error) {
    console.error('Error creating communication log:', error);
    return { success: false, message: 'Failed to log communication attempt after processing.', details: fcmDetails };
  }
}
