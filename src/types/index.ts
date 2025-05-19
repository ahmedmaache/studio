
export interface Announcement {
  id: string;
  title: string;
  content: string;
  summary?: string;
  categories?: string[];
  tags?: string[];
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  imageUrl?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: Date;
  location: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  imageUrl?: string;
}

export interface Decision {
  id: string;
  title: string;
  content: string;
  summary?: string;
  categories?: string[]; // e.g., 'Arrêté Municipal', 'Délibération du Conseil'
  tags?: string[]; // e.g., 'circulation', 'budget', 'urbanisme'
  status: 'draft' | 'published';
  decisionDate: Date; // Date the decision was made/effective
  referenceNumber?: string; // e.g., AM-2024-001
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  attachmentUrl?: string; // Link to a PDF or document
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
  userId: string; // In a real app, this would link to a User model
  citizenName: string; // Mock field
  subscribedCategories: string[]; // Array of category names or IDs
  prefersSms: boolean;
  prefersPush: boolean;
  phoneNumber?: string; // For SMS
  pushToken?: string; // For FCM
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
];
