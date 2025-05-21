// src/types/index.ts

export interface Announcement {
  id: string;
  title: string;
  content: string;
  summary?: string;
  categories?: string[];
  tags?: string[];
  status: ContentStatus; // Utilise l'enum Prisma directement ou un alias
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
  status: ContentStatus; // Utilise l'enum Prisma directement ou un alias
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
  status: ContentStatus; // Utilise l'enum Prisma directement ou un alias
  decisionDate: Date;
  referenceNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  attachmentUrl?: string;
  authorId: string;
}

// Utilisez les enums générés par Prisma si possible, ou assurez-vous qu'ils correspondent
// Pour la simplicité, nous allons les définir ici mais ils doivent être en phase avec Prisma
export enum ContentStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export interface Category {
  id: string; // This is more like a slug/key
  name: string; // This is the display name
  description?: string; // Optional description for the category
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
  { id: 'etat-civil', name: 'État Civil', description: 'Informations sur les actes de naissance, mariages, etc.' },
  { id: 'urbanisme', name: 'Urbanisme', description: 'Permis de construire, plans d_aménagement.' },
  { id: 'evenements', name: 'Événements Locaux', description: 'Festivals, marchés, réunions publiques.' },
  { id: 'annonces-officielles', name: 'Annonces Officielles', description: 'Communications importantes de la mairie.' },
  { id: 'sante', name: 'Santé Publique', description: 'Campagnes de vaccination, alertes sanitaires.' },
  { id: 'education', name: 'Éducation', description: 'Informations sur les écoles, inscriptions.' },
  { id: 'transport', name: 'Transport', description: 'Horaires des bus, travaux routiers affectant la circulation.' },
  { id: 'culture', name: 'Culture et Loisirs', description: 'Expositions, spectacles, activités sportives.' },
  { id: 'decisions-municipales', name: 'Décisions Municipales', description: 'Nouveaux arrêtés et délibérations.'},
  { id: 'environnement', name: 'Environnement', description: 'Collecte des déchets, initiatives écologiques.' },
  { id: 'securite', name: 'Sécurité', description: 'Alertes de sécurité, prévention.' },
  { id: 'aide-sociale', name: 'Aide Sociale', description: 'Informations sur les aides et services sociaux.' },
  { id: 'logement', name: 'Logement', description: 'Aides au logement, programmes immobiliers.' },
  { id: 'travaux-publics', name: 'Travaux Publics', description: 'Chantiers en cours, perturbations.' },
  { id: 'voirie', name: 'Voirie et Propreté', description: 'Nettoyage des rues, entretien des espaces verts.' },
  { id: 'alertes-meteo', name: 'Alertes Météo', description: 'Vigilance météo, conseils de prudence.'},
  { id: 'coupures-eau-electricite', name: 'Coupures Eau/Électricité', description: 'Informations sur les coupures programmées ou imprévues.'},
  { id: 'autres-demandes', name: 'Autres Demandes', description: 'Catégorie pour les demandes diverses.' },
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
  email?: string | null; // Gardé optionnel pour la flexibilité
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
  details?: any; // For Zod validation errors
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
