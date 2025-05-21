
"use server";

import { type Announcement, ContentStatus } from "@/types"; // Importer ContentStatus
import { revalidatePath } from "next/cache";

const placeholderAuthorId = "admin-user-placeholder"; // Pour les données simulées

// Mock database
let announcements: Announcement[] = [
  {
    id: "1",
    title: "Réunion publique sur le plan d'urbanisme",
    content: "Une réunion publique se tiendra le 15 juillet à 18h00 à la mairie pour discuter du nouveau plan d'urbanisme. Tous les citoyens sont invités à y participer et à exprimer leurs opinions.",
    summary: "Réunion publique sur le nouveau plan d'urbanisme le 15 juillet à 18h00 à la mairie.",
    categories: ["Urbanisme", "Réunion Publique"],
    tags: ["planification", "citoyenneté", "mairie"],
    status: ContentStatus.PUBLISHED, // Utiliser l'enum
    createdAt: new Date("2024-06-10T10:00:00Z"),
    updatedAt: new Date("2024-06-10T10:00:00Z"),
    publishedAt: new Date("2024-06-10T10:00:00Z"),
    imageUrl: "https://placehold.co/600x400.png",
    authorId: placeholderAuthorId,
  },
  {
    id: "2",
    title: "Campagne de vaccination contre la grippe",
    content: "La campagne annuelle de vaccination contre la grippe saisonnière débutera le 1er octobre. Les personnes éligibles peuvent se faire vacciner gratuitement au centre de santé municipal.",
    summary: "Campagne de vaccination antigrippale à partir du 1er octobre au centre de santé.",
    categories: ["Santé Publique", "Prévention"],
    tags: ["vaccination", "grippe", "santé"],
    status: ContentStatus.PUBLISHED, // Utiliser l'enum
    createdAt: new Date("2024-06-15T14:30:00Z"),
    updatedAt: new Date("2024-06-15T14:30:00Z"),
    publishedAt: new Date("2024-06-15T14:30:00Z"),
    imageUrl: "https://placehold.co/600x400.png",
    authorId: placeholderAuthorId,
  },
];

// Type pour les données de création, s'assurant que authorId est géré
// Omit<Announcement, "id" | "createdAt" | "updatedAt" | "publishedAt">
// En réalité, authorId viendrait de la session ou serait passé explicitement.
// Pour le mock, nous le fixons ou le rendons optionnel avec un fallback.
type CreateAnnouncementData = Omit<Announcement, "id" | "createdAt" | "updatedAt" | "publishedAt" | "authorId"> & { authorId?: string; status: ContentStatus };


export async function createAnnouncement(data: CreateAnnouncementData): Promise<Announcement | { error: string }> {
  try {
    const newAnnouncement: Announcement = {
      ...data,
      id: String(Date.now() + Math.random()), // Ensure unique ID
      authorId: data.authorId || placeholderAuthorId, // Utiliser l'authorId fourni ou un placeholder
      summary: data.summary || "", // Assurer que summary est une chaîne
      imageUrl: data.imageUrl || "", // Assurer que imageUrl est une chaîne
      categories: data.categories || [],
      tags: data.tags || [],
      status: data.status || ContentStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: data.status === ContentStatus.PUBLISHED ? new Date() : undefined,
    };

    announcements.unshift(newAnnouncement); // Add to the beginning of the list
    revalidatePath("/admin/announcements");
    revalidatePath("/admin/announcements/new");
    revalidatePath("/admin/dashboard");
    return newAnnouncement;
  } catch (error: any) {
    console.error("Error creating announcement:", error);
    return { error: error.message || "Failed to create announcement." };
  }
}

export async function getAnnouncements(): Promise<Announcement[]> {
  return Promise.resolve(announcements.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
}

export async function getAnnouncementById(id: string): Promise<Announcement | undefined> {
  return Promise.resolve(announcements.find(ann => ann.id === id));
}

// Le type pour data ici doit être Partial et exclure les champs non modifiables + authorId qui ne change pas à l'update
type UpdateAnnouncementData = Partial<Omit<Announcement, "id" | "createdAt" | "updatedAt" | "publishedAt" | "authorId">>;

export async function updateAnnouncement(id: string, data: UpdateAnnouncementData): Promise<Announcement | { error: string }> {
  try {
    const announcementIndex = announcements.findIndex(ann => ann.id === id);
    if (announcementIndex === -1) {
      return { error: "Announcement not found." };
    }
    const existingAnnouncement = announcements[announcementIndex];
    
    const updatedData: Partial<Announcement> = { // Utiliser Partial<Announcement> pour le type intermédiaire
      ...data,
      updatedAt: new Date(),
    };

    if (data.status === ContentStatus.PUBLISHED && existingAnnouncement.status !== ContentStatus.PUBLISHED) {
      updatedData.publishedAt = new Date();
    } else if (data.status === ContentStatus.DRAFT && existingAnnouncement.status === ContentStatus.PUBLISHED) {
      // Optionnel : que faire de publishedAt si on repasse à draft ? Le conserver ou le nullifier ?
      // Pour l'instant, on le conserve s'il existait. Si on veut le nullifier :
      // updatedData.publishedAt = undefined;
    }
    
    // Assurer que les champs optionnels sont bien des tableaux s'ils sont fournis dans data
    if (data.categories !== undefined) updatedData.categories = data.categories || [];
    if (data.tags !== undefined) updatedData.tags = data.tags || [];


    const updatedAnnouncement: Announcement = {
      ...existingAnnouncement,
      ...updatedData,
      // Forcer les types ici si nécessaire, car updatedData est Partial
      title: updatedData.title || existingAnnouncement.title,
      content: updatedData.content || existingAnnouncement.content,
      status: updatedData.status || existingAnnouncement.status,
    };
    
    announcements[announcementIndex] = updatedAnnouncement;
    revalidatePath("/admin/announcements");
    revalidatePath(`/admin/announcements/edit/${id}`);
    revalidatePath("/admin/dashboard");
    return updatedAnnouncement;
  } catch (error: any) {
    console.error("Error updating announcement:", error);
    return { error: error.message || "Failed to update announcement." };
  }
}

export async function deleteAnnouncement(id: string): Promise<{ success: boolean; error?: string, message?: string }> {
  try {
    const initialLength = announcements.length;
    announcements = announcements.filter(ann => ann.id !== id);
    if (announcements.length === initialLength) {
      return { success: false, error: "Announcement not found." };
    }
    revalidatePath("/admin/announcements");
    revalidatePath("/admin/dashboard");
    return { success: true, message: "Announcement deleted successfully." };
  } catch (error: any) {
    console.error("Error deleting announcement:", error);
    return { success: false, error: error.message || "Failed to delete announcement." };
  }
}
