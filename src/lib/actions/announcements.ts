
"use server";

import type { Announcement } from "@/types";
import { revalidatePath } from "next/cache";

// Mock database
let announcements: Announcement[] = [
  {
    id: "1",
    title: "Réunion publique sur le plan d'urbanisme",
    content: "Une réunion publique se tiendra le 15 juillet à 18h00 à la mairie pour discuter du nouveau plan d'urbanisme. Tous les citoyens sont invités à y participer et à exprimer leurs opinions.",
    summary: "Réunion publique sur le nouveau plan d'urbanisme le 15 juillet à 18h00 à la mairie.",
    categories: ["Urbanisme", "Réunion Publique"],
    tags: ["planification", "citoyenneté", "mairie"],
    status: "published",
    createdAt: new Date("2024-06-10T10:00:00Z"),
    updatedAt: new Date("2024-06-10T10:00:00Z"),
    publishedAt: new Date("2024-06-10T10:00:00Z"),
    imageUrl: "https://placehold.co/600x400.png",
  },
  {
    id: "2",
    title: "Campagne de vaccination contre la grippe",
    content: "La campagne annuelle de vaccination contre la grippe saisonnière débutera le 1er octobre. Les personnes éligibles peuvent se faire vacciner gratuitement au centre de santé municipal.",
    summary: "Campagne de vaccination antigrippale à partir du 1er octobre au centre de santé.",
    categories: ["Santé Publique", "Prévention"],
    tags: ["vaccination", "grippe", "santé"],
    status: "published",
    createdAt: new Date("2024-06-15T14:30:00Z"),
    updatedAt: new Date("2024-06-15T14:30:00Z"),
    publishedAt: new Date("2024-06-15T14:30:00Z"),
    imageUrl: "https://placehold.co/600x400.png",
  },
];

export async function createAnnouncement(data: Omit<Announcement, "id" | "createdAt" | "updatedAt" | "status"> & { status?: 'draft' | 'published' }): Promise<Announcement | { error: string }> {
  try {
    const newAnnouncement: Announcement = {
      ...data,
      id: String(Date.now() + Math.random()), // Ensure unique ID
      createdAt: new Date(),
      updatedAt: new Date(),
      status: data.status || 'draft',
      categories: data.categories || [],
      tags: data.tags || [],
    };
    announcements.unshift(newAnnouncement); // Add to the beginning of the list
    console.log("Announcement created:", newAnnouncement);
    revalidatePath("/admin/announcements");
    revalidatePath("/admin/announcements/new");
    revalidatePath("/admin/dashboard"); // Revalidate dashboard after creating
    return newAnnouncement;
  } catch (error) {
    console.error("Error creating announcement:", error);
    return { error: "Failed to create announcement." };
  }
}

export async function getAnnouncements(): Promise<Announcement[]> {
  // In a real app, fetch from database
  return Promise.resolve(announcements.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
}

export async function getAnnouncementById(id: string): Promise<Announcement | undefined> {
  return Promise.resolve(announcements.find(ann => ann.id === id));
}

export async function updateAnnouncement(id: string, data: Partial<Omit<Announcement, "id" | "createdAt" | "updatedAt">>): Promise<Announcement | { error: string }> {
  try {
    const announcementIndex = announcements.findIndex(ann => ann.id === id);
    if (announcementIndex === -1) {
      return { error: "Announcement not found." };
    }
    const existingAnnouncement = announcements[announcementIndex];
    const updatedAnnouncement: Announcement = {
      ...existingAnnouncement,
      ...data,
      updatedAt: new Date(),
    };
    announcements[announcementIndex] = updatedAnnouncement;
    console.log("Announcement updated:", updatedAnnouncement);
    revalidatePath("/admin/announcements");
    revalidatePath(`/admin/announcements/edit/${id}`);
    revalidatePath("/admin/dashboard"); // Revalidate dashboard after updating
    return updatedAnnouncement;
  } catch (error) {
    console.error("Error updating announcement:", error);
    return { error: "Failed to update announcement." };
  }
}

export async function deleteAnnouncement(id: string): Promise<{ success: boolean; error?: string, message?: string }> {
  try {
    const initialLength = announcements.length;
    announcements = announcements.filter(ann => ann.id !== id);
    if (announcements.length === initialLength) {
      return { success: false, error: "Announcement not found." };
    }
    console.log("Announcement deleted:", id);
    revalidatePath("/admin/announcements");
    revalidatePath("/admin/dashboard"); // Revalidate dashboard after deleting
    return { success: true, message: "Announcement deleted successfully." };
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return { success: false, error: "Failed to delete announcement." };
  }
}
