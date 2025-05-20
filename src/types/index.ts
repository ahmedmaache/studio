// src/types/index.ts

export interface Announcement {
  id: string;
  title: string;
  content: string;
  summary?: string;
  categories?: string[]; // Updated to array
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
// This can be removed if we import directly from @prisma/client where needed,
// but having it here can be useful for frontend type safety without direct prisma dependency.
export enum ContentStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export interface Category {
  id: string; // This is more like a slug/key
  name: string; // This is the display name
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
  { id: 'alertes-meteo', name: 'Alertes Météo'}, // Example new category
  { id: 'coupures-eau-electricite', name: 'Coupures Eau/Électricité'}, // Example
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
  adminId: string; // Can be Citizen ID if action is 'CREATED'
  adminName?: string | null;
  action: 'STATUS_CHANGE' | 'ASSIGNMENT' | 'NOTE_ADDED' | 'CREATED';
  oldStatus?: ServiceRequestStatus;
  newStatus?: ServiceRequestStatus;
  assignedToAdminId?: string | null;
  assignedToAdminName?: string | null;
  notes?: string;
  description?: string; // For 'CREATED' action: initial description summary
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
  email?: string | null; // Added email for potential display
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

export enum CommunicationStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  PARTIALLY_FAILED = "PARTIALLY_FAILED",
  FAILED = "FAILED",
  DRAFT = "DRAFT",
  SCHEDULED = "SCHEDULED",
}

export interface CommunicationLog {
  id: string;
  messageContent: string;
  channels: { sms?: boolean; push?: boolean; whatsapp?: boolean };
  targetAudienceCategories: string[];
  targetCitizenIds: string[];
  status: CommunicationStatus;
  scheduledAt?: Date | null;
  sentAt?: Date | null;
  failureReason?: string | null;
  fcmMessageIds?: string[];
  fcmSuccessCount?: number | null;
  fcmFailureCount?: number | null;
  adminId: string;
  // admin: User; // Relation
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSubscriptionPreference {
  categoryName: string; // Should match a name from availableCategories
  isActive: boolean;
}

export interface NotificationSubscription extends NotificationSubscriptionPreference {
 id: string;
 citizenId: string;
 createdAt: Date;
 updatedAt: Date;
}
