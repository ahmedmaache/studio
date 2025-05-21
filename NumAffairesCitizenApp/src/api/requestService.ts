
// src/api/requestService.ts
import { Alert } from 'react-native';

// Remplacez par l'URL de base de votre backend Next.js (partie citoyen)
const API_BASE_URL = 'http://localhost:9002/api/citizen';

export interface ServiceRequestHistoryEntry {
  timestamp: string;
  adminId: string;
  adminName?: string | null;
  action: 'STATUS_CHANGE' | 'ASSIGNMENT' | 'NOTE_ADDED' | 'CREATED';
  oldStatus?: string; // ServiceRequestStatus enum from backend
  newStatus?: string; // ServiceRequestStatus enum from backend
  assignedToAdminId?: string | null;
  assignedToAdminName?: string | null;
  notes?: string;
  description?: string;
}

export interface ServiceRequest {
  id: string;
  requestType: string;
  description: string;
  attachments: string[];
  status: string; // Should match ServiceRequestStatus enum from backend
  resolutionNotes?: string | null;
  adminNotes?: string | null;
  historyLog: ServiceRequestHistoryEntry[];
  citizenId: string;
  assignedAdminId?: string | null;
  assignedAdmin?: { name?: string | null } | null; // Assuming admin name might be nested
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

export interface CreateServiceRequestPayload {
  requestType: string;
  description: string;
  attachments?: string[];
}

export interface CreateServiceRequestResponse {
  success: boolean;
  data?: ServiceRequest;
  error?: string;
  details?: any; // For Zod validation errors
}

export interface GetMyServiceRequestsResponse {
  success: boolean;
  data?: {
    requests: Pick<ServiceRequest, 'id' | 'requestType' | 'status' | 'createdAt' | 'updatedAt'>[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  error?: string;
}

export interface GetMyServiceRequestDetailsResponse {
  success: boolean;
  data?: ServiceRequest;
  error?: string;
}

const handleApiError = (error: any, defaultMessage: string): { success: false, error: string } => {
  console.error("API Service Error:", error);
  if (error instanceof Error) {
    return { success: false, error: error.message || defaultMessage };
  }
  return { success: false, error: defaultMessage };
};

export const requestService = {
  createServiceRequest: async (
    payload: CreateServiceRequestPayload,
    token: string
  ): Promise<CreateServiceRequestResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/service-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data: CreateServiceRequestResponse = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.error || data.details || `HTTP error! status: ${response.status}` };
      }
      return data;
    } catch (error) {
      return handleApiError(error, "Failed to create service request due to a network issue.");
    }
  },

  getMyServiceRequests: async (
    token: string,
    page: number = 1,
    limit: number = 10
  ): Promise<GetMyServiceRequestsResponse> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/service-requests?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const data: GetMyServiceRequestsResponse = await response.json();
       if (!response.ok || !data.success) {
        return { success: false, error: data.error || `HTTP error! status: ${response.status}` };
      }
      return data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch service requests due to a network issue.");
    }
  },

  getMyServiceRequestDetails: async (
    requestId: string,
    token: string
  ): Promise<GetMyServiceRequestDetailsResponse> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/service-requests/${requestId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const data: GetMyServiceRequestDetailsResponse = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.error || `HTTP error! status: ${response.status}` };
      }
      return data;
    } catch (error) {
      return handleApiError(error, `Failed to fetch details for request ${requestId} due to a network issue.`);
    }
  },
};
