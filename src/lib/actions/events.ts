
"use server";

import { type Event, ContentStatus } from "@/types";
import { revalidatePath } from "next/cache";

const placeholderAuthorId = "admin-user-placeholder"; // Pour les données simulées

// Mock database for events
let events: Event[] = [
  {
    id: "event1",
    title: "Fête de l'Indépendance - Célébrations Locales",
    description: "Rejoignez-nous pour célébrer la Fête de l'Indépendance avec des feux d'artifice, de la musique et des activités pour toute la famille sur la place principale.",
    eventDate: new Date("2024-07-05T18:00:00Z"),
    location: "Place Principale de la Ville",
    status: ContentStatus.PUBLISHED,
    createdAt: new Date("2024-06-20T10:00:00Z"),
    updatedAt: new Date("2024-06-20T11:30:00Z"),
    publishedAt: new Date("2024-06-20T11:30:00Z"),
    imageUrl: "https://placehold.co/600x400.png",
    authorId: placeholderAuthorId,
  },
  {
    id: "event2",
    title: "Marché des Artisans Locaux",
    description: "Découvrez le talent de nos artisans locaux. Vente de produits faits main, dégustations et animations.",
    eventDate: new Date("2024-08-12T09:00:00Z"),
    location: "Parc Municipal",
    status: ContentStatus.DRAFT,
    createdAt: new Date("2024-07-01T15:00:00Z"),
    updatedAt: new Date("2024-07-01T15:00:00Z"),
    imageUrl: "https://placehold.co/600x400.png",
    authorId: placeholderAuthorId,
  },
];

type CreateEventData = Omit<Event, "id" | "createdAt" | "updatedAt" | "publishedAt" | "authorId"> & { authorId?: string; status: ContentStatus };

export async function createEvent(data: CreateEventData): Promise<Event | { error: string }> {
  try {
    const newEvent: Event = {
      ...data,
      id: String(Date.now() + Math.random()),
      authorId: data.authorId || placeholderAuthorId,
      imageUrl: data.imageUrl || "",
      status: data.status || ContentStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: data.status === ContentStatus.PUBLISHED ? new Date() : undefined,
    };
    events.unshift(newEvent);
    revalidatePath("/admin/events");
    revalidatePath("/admin/dashboard"); 
    return newEvent;
  } catch (error: any) {
    console.error("Error creating event:", error);
    return { error: error.message || "Failed to create event." };
  }
}

export async function getEvents(): Promise<Event[]> {
  return Promise.resolve(events.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
}

export async function getEventById(id: string): Promise<Event | undefined> {
  return Promise.resolve(events.find(event => event.id === id));
}

type UpdateEventData = Partial<Omit<Event, "id" | "createdAt" | "updatedAt" | "publishedAt" | "authorId">>;

export async function updateEvent(id: string, data: UpdateEventData): Promise<Event | { error: string }> {
  try {
    const eventIndex = events.findIndex(event => event.id === id);
    if (eventIndex === -1) {
      return { error: "Event not found." };
    }
    const existingEvent = events[eventIndex];
    
    const updatedData: Partial<Event> = {
      ...data,
      updatedAt: new Date(),
    };

    if (data.status === ContentStatus.PUBLISHED && existingEvent.status !== ContentStatus.PUBLISHED) {
      updatedData.publishedAt = new Date();
    } else if (data.status === ContentStatus.DRAFT && existingEvent.status === ContentStatus.PUBLISHED) {
      // updatedData.publishedAt = undefined; // Optionnel
    }
    
    const updatedEvent: Event = {
      ...existingEvent,
      ...updatedData,
      title: updatedData.title || existingEvent.title,
      description: updatedData.description || existingEvent.description,
      eventDate: updatedData.eventDate || existingEvent.eventDate,
      location: updatedData.location || existingEvent.location,
      status: updatedData.status || existingEvent.status,
    };
    
    events[eventIndex] = updatedEvent;
    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/edit/${id}`);
    revalidatePath("/admin/dashboard");
    return updatedEvent;
  } catch (error: any) {
    console.error("Error updating event:", error);
    return { error: error.message || "Failed to update event." };
  }
}

export async function deleteEvent(id: string): Promise<{ success: boolean; error?: string, message?: string }> {
  try {
    const initialLength = events.length;
    events = events.filter(event => event.id !== id);
    if (events.length === initialLength) {
      return { success: false, error: "Event not found." };
    }
    revalidatePath("/admin/events");
    revalidatePath("/admin/dashboard");
    return { success: true, message: "Event deleted successfully." };
  } catch (error: any) {
    console.error("Error deleting event:", error);
    return { success: false, error: error.message || "Failed to delete event." };
  }
}
