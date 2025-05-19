
"use server";

import type { Event } from "@/types";
import { revalidatePath } from "next/cache";

// Mock database for events
let events: Event[] = [
  {
    id: "event1",
    title: "Fête de l'Indépendance - Célébrations Locales",
    description: "Rejoignez-nous pour célébrer la Fête de l'Indépendance avec des feux d'artifice, de la musique et des activités pour toute la famille sur la place principale.",
    eventDate: new Date("2024-07-05T18:00:00Z"),
    location: "Place Principale de la Ville",
    status: "published",
    createdAt: new Date("2024-06-20T10:00:00Z"),
    updatedAt: new Date("2024-06-20T11:30:00Z"),
    publishedAt: new Date("2024-06-20T11:30:00Z"),
    imageUrl: "https://placehold.co/600x400.png",
  },
  {
    id: "event2",
    title: "Marché des Artisans Locaux",
    description: "Découvrez le talent de nos artisans locaux. Vente de produits faits main, dégustations et animations.",
    eventDate: new Date("2024-08-12T09:00:00Z"),
    location: "Parc Municipal",
    status: "draft",
    createdAt: new Date("2024-07-01T15:00:00Z"),
    updatedAt: new Date("2024-07-01T15:00:00Z"),
    imageUrl: "https://placehold.co/600x400.png",
  },
];

export async function createEvent(data: Omit<Event, "id" | "createdAt" | "updatedAt">): Promise<Event | { error: string }> {
  try {
    const newEvent: Event = {
      ...data,
      id: String(Date.now() + Math.random()),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    if (newEvent.status === 'published' && !newEvent.publishedAt) {
      newEvent.publishedAt = new Date();
    }
    events.unshift(newEvent);
    revalidatePath("/admin/events");
    revalidatePath("/admin/dashboard"); 
    return newEvent;
  } catch (error) {
    console.error("Error creating event:", error);
    return { error: "Failed to create event." };
  }
}

export async function getEvents(): Promise<Event[]> {
  return Promise.resolve(events.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
}

export async function getEventById(id: string): Promise<Event | undefined> {
  return Promise.resolve(events.find(event => event.id === id));
}

export async function updateEvent(id: string, data: Partial<Omit<Event, "id" | "createdAt" | "updatedAt">>): Promise<Event | { error: string }> {
  try {
    const eventIndex = events.findIndex(event => event.id === id);
    if (eventIndex === -1) {
      return { error: "Event not found." };
    }
    const existingEvent = events[eventIndex];
    
    const updatedEventData: Partial<Event> = {
      ...data,
      updatedAt: new Date(),
    };

    if (data.status === "published" && existingEvent.status !== "published") {
      updatedEventData.publishedAt = new Date();
    } else if (data.status === "draft" && existingEvent.status === "published") {
      // Optionally clear publishedAt or keep it, for now we keep it
    }
    
    const updatedEvent: Event = {
      ...existingEvent,
      ...updatedEventData,
    };
    
    events[eventIndex] = updatedEvent;
    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/edit/${id}`);
    revalidatePath("/admin/dashboard");
    return updatedEvent;
  } catch (error) {
    console.error("Error updating event:", error);
    return { error: "Failed to update event." };
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
  } catch (error) {
    console.error("Error deleting event:", error);
    return { success: false, error: "Failed to delete event." };
  }
}
