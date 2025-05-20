// src/types/index.ts

export interface Announcement {
  id: string;
  title: string;
  content: string;
  summary?: string; 
  categories?: string[];
  tags?: string[];   
  status: ContentStatus; 
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  imageUrl?: string; 
  authorId: string;
  // author?: User; // Prisma User type would be imported if needed here
}

export interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: Date;
  location: string;
  status: ContentStatus;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  imageUrl?: string;
  authorId: string;
}

export interface Decision {
  id: string;
  title: string;
  content: string;
  summary?: string; 
  categories?: string[]; 
  tags?: string[];    
  status: ContentStatus;
  decisionDate: Date; 
  referenceNumber?: string; 
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  attachmentUrl?: string; 
  authorId: string;
}

// Enum for Content Status, matching Prisma schema
export enum ContentStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export interface Category {
  id: string;
  name: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface UserSubscription {
  id: string;
  userId: string; 
  citizenName: string; 
  subscribedCategories: string[]; 
  prefersSms: boolean;
  prefersPush: boolean;
  phoneNumber?: string; 
  pushToken?: string; 
}


export const availableCategories: Category[] = [
  { id: 'etat-civil', name: 'État Civil' },
  { id: 'urbanisme', name: 'Urbanisme' },
  { id: 'evenements', name: 'Événements Locaux' },
  { id: 'annonces-officielles', name: 'Annonces Officielles' },
  { id: 'sante', name: 'Santé Publique' },
  { id: 'education', name: 'Éducation' },
  { id: 'transport', name: 'Transport' },
  { id: 'culture', name: 'Culture et Loisirs' },
  { id: 'decisions-municipales', name: 'Décisions Municipales'},
  { id: 'environnement', name: 'Environnement' },
  { id: 'securite', name: 'Sécurité' },
  { id: 'aide-sociale', name: 'Aide Sociale' },
  { id: 'logement', name: 'Logement' },
  { id: 'travaux-publics', name: 'Travaux Publics' },
  { id: 'voirie', name: 'Voirie et Propreté' },
  { id: 'autres-demandes', name: 'Autres Demandes' },
];

export enum ServiceRequestStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  REJECTED = "REJECTED",
}

export interface ServiceRequestHistoryEntry {
  timestamp: string; 
  adminId: string;
  adminName?: string | null;
  action: 'STATUS_CHANGE' | 'ASSIGNMENT' | 'NOTE_ADDED' | 'CREATED';
  oldStatus?: ServiceRequestStatus;
  newStatus?: ServiceRequestStatus;
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
  status: ServiceRequestStatus;
  resolutionNotes?: string | null;
  adminNotes?: string | null;
  historyLog: ServiceRequestHistoryEntry[]; 
  citizenId: string;
  // citizen: Citizen; // Prisma Citizen type
  assignedAdminId?: string | null;
  // assignedAdmin?: User | null; // Prisma User type
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUserForSelect {
  id: string;
  name: string | null;
}

// Types for Citizen Service Request API
export interface CitizenServiceRequestCreatePayload {
  requestType: string;
  description: string;
  attachments?: string[];
}

export interface CitizenServiceRequestCreateResponse {
  success: boolean;
  data?: ServiceRequest;
  error?: string;
}

export interface CitizenServiceRequestListResponse {
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

export interface CitizenServiceRequestDetailsResponse {
  success: boolean;
  data?: ServiceRequest; // Full details including historyLog
  error?: string;
}
