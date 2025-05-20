import { Alert } from 'react-native';

const API_BASE_URL = 'YOUR_BACKEND_API_URL'; // TODO: Replace with your actual backend URL

export interface ServiceRequest {
  id: string;
  requestType: string;
  description: string;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Rejected'; // Example statuses
  submittedAt: string; // ISO date string
  updatedAt: string; // ISO date string
  attachments?: string[]; // URLs of attachments
  historyLog?: RequestHistoryEntry[];
}

export interface RequestHistoryEntry {
  status: string;
  timestamp: string; // ISO date string
  notes?: string;
}

export interface CreateServiceRequestPayload {
  requestType: string;
  description: string;
  attachments?: string[];
}

export interface GetServiceRequestsResponse {
  requests: ServiceRequest[];
  total: number;
  page: number;
  limit: number;
}

const handleApiError = (error: any, defaultMessage: string) => {
  console.error("API Error:", error);
  Alert.alert("Error", error.message || defaultMessage);
};

export const createServiceRequest = async (
  token: string,
  payload: CreateServiceRequestPayload
): Promise<ServiceRequest | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/citizen/service-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const newRequest: ServiceRequest = await response.json();
    return newRequest;
  } catch (error) {
    handleApiError(error, "Failed to create service request.");
    return null;
  }
};

export const getMyServiceRequests = async (
  token: string,
  page: number = 1,
  limit: number = 10
): Promise<GetServiceRequestsResponse | null> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/citizen/service-requests?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: GetServiceRequestsResponse = await response.json();
    return data;
  } catch (error) {
    handleApiError(error, "Failed to fetch service requests.");
    return null;
  }
};

export const getMyServiceRequestDetails = async (
  token: string,
  requestId: string
): Promise<ServiceRequest | null> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/citizen/service-requests/${requestId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: ServiceRequest = await response.json();
    return data;
  } catch (error) {
    handleApiError(error, `Failed to fetch details for request ${requestId}.`);
    return null;
  }
};