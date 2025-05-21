
"use server";

import { type Decision, ContentStatus } from "@/types";
import { revalidatePath } from "next/cache";

const placeholderAuthorId = "admin-user-placeholder"; // Pour les données simulées

// Mock database for decisions
let decisions: Decision[] = [
  {
    id: "dec1",
    title: "Arrêté municipal n°2024-001: Circulation et stationnement",
    content: "Considérant la nécessité de réglementer la circulation et le stationnement dans le centre-ville pour améliorer la fluidité du trafic et la sécurité des piétons, il est arrêté ce qui suit...",
    summary: "Nouvelles règles de circulation et stationnement en centre-ville.",
    categories: ["Décisions Municipales", "Transport"],
    tags: ["arrêté", "circulation", "stationnement", "centre-ville"],
    status: ContentStatus.PUBLISHED,
    decisionDate: new Date("2024-07-10T00:00:00Z"),
    referenceNumber: "AM-2024-001",
    createdAt: new Date("2024-07-01T09:00:00Z"),
    updatedAt: new Date("2024-07-01T09:30:00Z"),
    publishedAt: new Date("2024-07-01T09:30:00Z"),
    attachmentUrl: "https://placehold.co/pdf-document.pdf",
    authorId: placeholderAuthorId,
  },
  {
    id: "dec2",
    title: "Délibération du conseil n°2024-015: Budget primitif 2025",
    content: "Le conseil municipal, après en avoir délibéré, adopte le budget primitif pour l'exercice 2025 tel que présenté par la commission des finances.",
    summary: "Adoption du budget primitif pour l'année 2025.",
    categories: ["Décisions Municipales", "Finance"],
    tags: ["délibération", "budget", "conseil municipal"],
    status: ContentStatus.DRAFT,
    decisionDate: new Date("2024-07-15T00:00:00Z"),
    referenceNumber: "DEL-2024-015",
    createdAt: new Date("2024-07-05T14:00:00Z"),
    updatedAt: new Date("2024-07-05T14:00:00Z"),
    authorId: placeholderAuthorId,
  },
];

type CreateDecisionData = Omit<Decision, "id" | "createdAt" | "updatedAt" | "publishedAt" | "authorId"> & { authorId?: string; status: ContentStatus };


export async function createDecision(data: CreateDecisionData): Promise<Decision | { error: string }> {
  try {
    const newDecision: Decision = {
      ...data,
      id: String(Date.now() + Math.random()),
      authorId: data.authorId || placeholderAuthorId,
      summary: data.summary || "",
      attachmentUrl: data.attachmentUrl || "",
      categories: data.categories || [],
      tags: data.tags || [],
      status: data.status || ContentStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: data.status === ContentStatus.PUBLISHED ? new Date() : undefined,
    };
    decisions.unshift(newDecision);
    revalidatePath("/admin/decisions");
    revalidatePath("/admin/dashboard"); 
    return newDecision;
  } catch (error: any) {
    console.error("Error creating decision:", error);
    return { error: error.message || "Failed to create decision." };
  }
}

export async function getDecisions(): Promise<Decision[]> {
  return Promise.resolve(decisions.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
}

export async function getDecisionById(id: string): Promise<Decision | undefined> {
  return Promise.resolve(decisions.find(decision => decision.id === id));
}

type UpdateDecisionData = Partial<Omit<Decision, "id" | "createdAt" | "updatedAt" | "publishedAt" | "authorId">>;

export async function updateDecision(id: string, data: UpdateDecisionData): Promise<Decision | { error: string }> {
  try {
    const decisionIndex = decisions.findIndex(decision => decision.id === id);
    if (decisionIndex === -1) {
      return { error: "Decision not found." };
    }
    const existingDecision = decisions[decisionIndex];
    
    const updatedData: Partial<Decision> = {
      ...data,
      updatedAt: new Date(),
    };

    if (data.status === ContentStatus.PUBLISHED && existingDecision.status !== ContentStatus.PUBLISHED) {
      updatedData.publishedAt = new Date();
    } else if (data.status === ContentStatus.DRAFT && existingDecision.status === ContentStatus.PUBLISHED) {
      // updatedData.publishedAt = undefined; // Optionnel
    }

    if (data.categories !== undefined) updatedData.categories = data.categories || [];
    if (data.tags !== undefined) updatedData.tags = data.tags || [];
    
    const updatedDecision: Decision = {
      ...existingDecision,
      ...updatedData,
      title: updatedData.title || existingDecision.title,
      content: updatedData.content || existingDecision.content,
      decisionDate: updatedData.decisionDate || existingDecision.decisionDate,
      status: updatedData.status || existingDecision.status,
    };
    
    decisions[decisionIndex] = updatedDecision;
    revalidatePath("/admin/decisions");
    revalidatePath(`/admin/decisions/edit/${id}`);
    revalidatePath("/admin/dashboard");
    return updatedDecision;
  } catch (error: any) {
    console.error("Error updating decision:", error);
    return { error: error.message || "Failed to update decision." };
  }
}

export async function deleteDecision(id: string): Promise<{ success: boolean; error?: string, message?: string }> {
  try {
    const initialLength = decisions.length;
    decisions = decisions.filter(decision => decision.id !== id);
    if (decisions.length === initialLength) {
      return { success: false, error: "Decision not found." };
    }
    revalidatePath("/admin/decisions");
    revalidatePath("/admin/dashboard");
    return { success: true, message: "Decision deleted successfully." };
  } catch (error: any) {
    console.error("Error deleting decision:", error);
    return { success: false, error: error.message || "Failed to delete decision." };
  }
}
