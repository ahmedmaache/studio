

export interface Announcement {
  id: string;
  title: string;
  content: string;
  summaryAI?: string; // Kept summaryAI as per schema intent, but forms use 'summary'
  categories?: string[];
  tagsAI?: string[];   // Kept tagsAI as per schema intent, but forms use 'tags'
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; // Aligned with ContentStatus enum
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  imageUrl?: string; // Renamed from imageUrlAI in schema for consistency
  authorId: string;
  // author?: User; // Prisma User type would be imported if needed here
}

export interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: Date;
  location: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; // Aligned with ContentStatus enum
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
  summary?: string; // Renamed from summaryAI in schema
  categories?: string[]; 
  tags?: string[];    // Renamed from tagsAI in schema
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; // Aligned with ContentStatus enum
  decisionDate: Date; 
  referenceNumber?: string; 
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  attachmentUrl?: string; 
  authorId: string;
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

// Mock data for categories, often this would come from a DB
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
  // Added more specific categories often relevant to citizen services
  { id: 'environnement', name: 'Environnement' },
  { id: 'securite', name: 'Sécurité' },
  { id: 'aide-sociale', name: 'Aide Sociale' },
  { id: 'logement', name: 'Logement' },
  { id: 'travaux-publics', name: 'Travaux Publics' },
];

// Enum for Service Request Status, matching Prisma schema
export enum ServiceRequestStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  REJECTED = "REJECTED",
}

// Interface for Service Request History Log entries
export interface ServiceRequestHistoryEntry {
  timestamp: string; // ISO string date
  adminId: string;
  adminName?: string | null;
  action: 'STATUS_CHANGE' | 'ASSIGNMENT' | 'NOTE_ADDED' | 'CREATED';
  oldStatus?: ServiceRequestStatus;
  newStatus?: ServiceRequestStatus;
  assignedToAdminId?: string | null;
  assignedToAdminName?: string | null;
  notes?: string; // General notes for any action
  description?: string; // For CREATED action initial description
}

// Interface for Service Request data (subset of Prisma model for client-side use if needed)
export interface ServiceRequest {
  id: string;
  requestType: string;
  description: string;
  attachments: string[];
  status: ServiceRequestStatus;
  resolutionNotes?: string | null;
  adminNotes?: string | null;
  historyLog: ServiceRequestHistoryEntry[]; // Changed from Json? to typed array
  citizenId: string;
  // citizen: Citizen; // Prisma Citizen type
  assignedAdminId?: string | null;
  // assignedAdmin?: User | null; // Prisma User type
  createdAt: Date;
  updatedAt: Date;
}
