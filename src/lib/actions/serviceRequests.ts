
'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { ServiceRequest, ServiceRequestHistoryEntry, ServiceRequestStatus as SRStatusType } from '@/types'; // Assuming SRStatusType is the enum
import { Prisma } from '@prisma/client'; // For Prisma types if needed
import { revalidatePath } from 'next/cache';

// Ensure ServiceRequestStatus from Prisma is used for DB values if different from type alias
const PrismaServiceRequestStatus = Prisma.ServiceRequestStatus;


interface GetServiceRequestsFilters {
  status?: SRStatusType;
  requestType?: string;
  dateFrom?: string; // ISO Date string
  dateTo?: string;   // ISO Date string
}

interface GetServiceRequestsPagination {
  page: number;
  pageSize: number;
}

export async function getServiceRequestsForAdmin(
  filters: GetServiceRequestsFilters,
  pagination: GetServiceRequestsPagination
): Promise<{ success: boolean; data?: { requests: any[], totalRecords: number, totalPages: number }; error?: string }> {
  try {
    const { status, requestType, dateFrom, dateTo } = filters;
    const { page, pageSize } = pagination;

    const whereClause: Prisma.ServiceRequestWhereInput = {};

    if (status) {
      whereClause.status = status as Prisma.ServiceRequestStatus;
    }
    if (requestType) {
      whereClause.requestType = { contains: requestType, mode: 'insensitive' };
    }
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.createdAt.lte = new Date(new Date(dateTo).setHours(23, 59, 59, 999)); // Include full end day
      }
    }

    const skip = (page - 1) * pageSize;

    const [requests, totalRecords] = await prisma.$transaction([
      prisma.serviceRequest.findMany({
        where: whereClause,
        include: {
          citizen: {
            select: { id: true, name: true, phoneNumber: true },
          },
          assignedAdmin: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.serviceRequest.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalRecords / pageSize);

    return { success: true, data: { requests, totalRecords, totalPages } };
  } catch (error) {
    console.error('Error fetching service requests for admin:', error);
    return { success: false, error: 'Failed to fetch service requests.' };
  }
}

export async function getServiceRequestDetailsAdmin(
  requestId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const request = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: {
        citizen: true, // Include full citizen details
        assignedAdmin: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!request) {
      return { success: false, error: 'Service request not found.' };
    }
    // Ensure historyLog is parsed if it's a JSON string, or handled if it's already an object/array
    let historyLog = request.historyLog;
    if (typeof request.historyLog === 'string') {
        try {
            historyLog = JSON.parse(request.historyLog);
        } catch (e) {
            console.error("Failed to parse historyLog JSON:", e);
            historyLog = []; // Default to empty array on parse error
        }
    } else if (request.historyLog === null || request.historyLog === undefined) {
        historyLog = [];
    }


    return { success: true, data: {...request, historyLog } };
  } catch (error) {
    console.error(`Error fetching service request details for admin (ID: ${requestId}):`, error);
    return { success: false, error: 'Failed to fetch service request details.' };
  }
}

async function addHistoryEntry(
  existingLog: ServiceRequestHistoryEntry[] | Prisma.JsonValue | null | undefined,
  entry: ServiceRequestHistoryEntry
): Promise<ServiceRequestHistoryEntry[]> {
  let currentLog: ServiceRequestHistoryEntry[] = [];
  if (Array.isArray(existingLog)) {
    currentLog = existingLog;
  } else if (typeof existingLog === 'string') { // Should not happen if Prisma typed correctly
    try {
      currentLog = JSON.parse(existingLog) as ServiceRequestHistoryEntry[];
      if (!Array.isArray(currentLog)) currentLog = [];
    } catch {
      currentLog = [];
    }
  } else if (existingLog && typeof existingLog === 'object' && !Array.isArray(existingLog)) {
    // This case handles if Prisma.JsonValue is an object but not an array. Unlikely for a log.
    // Potentially log a warning or try to salvage if it represents a single entry. For now, reset.
    console.warn("History log was an object, not an array. Resetting log for new entry.");
    currentLog = [];
  }
  return [...currentLog, entry];
}


export async function updateServiceRequestStatusAdmin(
  requestId: string,
  newStatus: SRStatusType,
  adminNotes?: string,
  resolutionNotes?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role) {
    return { success: false, error: 'Unauthorized: Admin access required.' };
  }
  const adminId = session.user.id;
  const adminName = session.user.name;

  try {
    const serviceRequest = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
    if (!serviceRequest) {
      return { success: false, error: 'Service request not found.' };
    }

    const oldStatus = serviceRequest.status as SRStatusType;

    const historyEntry: ServiceRequestHistoryEntry = {
      timestamp: new Date().toISOString(),
      adminId,
      adminName,
      action: 'STATUS_CHANGE',
      oldStatus,
      newStatus,
      notes: adminNotes || resolutionNotes,
    };
    
    const updatedHistoryLog = await addHistoryEntry(serviceRequest.historyLog, historyEntry);

    const updatedRequest = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        status: newStatus as Prisma.ServiceRequestStatus,
        adminNotes: adminNotes !== undefined ? adminNotes : serviceRequest.adminNotes,
        resolutionNotes: resolutionNotes !== undefined ? resolutionNotes : serviceRequest.resolutionNotes,
        historyLog: updatedHistoryLog as unknown as Prisma.InputJsonValue, // Cast to Prisma.InputJsonValue
      },
    });
    revalidatePath('/admin/service-requests');
    revalidatePath(`/admin/service-requests/${requestId}`);
    return { success: true, data: updatedRequest };
  } catch (error) {
    console.error(`Error updating service request status (ID: ${requestId}):`, error);
    return { success: false, error: 'Failed to update service request status.' };
  }
}

export async function assignServiceRequestAdmin(
  requestId: string,
  targetAdminId: string | null
): Promise<{ success: boolean; data?: any; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role) {
    return { success: false, error: 'Unauthorized: Admin access required.' };
  }
  const currentAdminId = session.user.id;
  const currentAdminName = session.user.name;

  try {
    const serviceRequest = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
    if (!serviceRequest) {
      return { success: false, error: 'Service request not found.' };
    }
    
    let targetAdminName: string | null | undefined = null;
    if (targetAdminId) {
        const targetAdmin = await prisma.user.findUnique({ where: { id: targetAdminId }, select: { name: true }});
        targetAdminName = targetAdmin?.name;
    }

    const historyEntry: ServiceRequestHistoryEntry = {
      timestamp: new Date().toISOString(),
      adminId: currentAdminId,
      adminName: currentAdminName,
      action: 'ASSIGNMENT',
      assignedToAdminId: targetAdminId,
      assignedToAdminName: targetAdminName,
      notes: targetAdminId ? `Assigned to ${targetAdminName || targetAdminId}` : 'Unassigned',
    };

    const updatedHistoryLog = await addHistoryEntry(serviceRequest.historyLog, historyEntry);

    const updatedRequest = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        assignedAdminId: targetAdminId,
        historyLog: updatedHistoryLog as unknown as Prisma.InputJsonValue,
      },
    });
    revalidatePath('/admin/service-requests');
    revalidatePath(`/admin/service-requests/${requestId}`);
    return { success: true, data: updatedRequest };
  } catch (error) {
    console.error(`Error assigning service request (ID: ${requestId}):`, error);
    return { success: false, error: 'Failed to assign service request.' };
  }
}

// Helper function to create an initial history log entry when a request is created
// This would typically be called from the action that creates the service request from citizen app
export function createInitialHistoryLogEntry(
    citizenId: string, 
    citizenName: string | null | undefined, 
    description: string
): ServiceRequestHistoryEntry[] {
  return [{
    timestamp: new Date().toISOString(),
    // For CREATED, adminId might be system or the citizenId if self-service
    adminId: citizenId, // Or a system user ID
    adminName: citizenName || 'System', // Or citizen name
    action: 'CREATED',
    newStatus: PrismaServiceRequestStatus.PENDING,
    description: description,
  }];
}
