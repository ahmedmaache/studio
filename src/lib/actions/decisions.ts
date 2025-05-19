
"use server";

import type { Decision } from "@/types";
import { revalidatePath } from "next/cache";

// Mock database for decisions
let decisions: Decision[] = [
  {
    id: "dec1",
    title: "Arrêté municipal n°2024-001: Circulation et stationnement",
    content: "Considérant la nécessité de réglementer la circulation et le stationnement dans le centre-ville pour améliorer la fluidité du trafic et la sécurité des piétons, il est arrêté ce qui suit...",
    summary: "Nouvelles règles de circulation et stationnement en centre-ville.",
    categories: ["Décisions Municipales", "Transport"],
    tags: ["arrêté", "circulation", "stationnement", "centre-ville"],
    status: "published",
    decisionDate: new Date("2024-07-10T00:00:00Z"),
    referenceNumber: "AM-2024-001",
    createdAt: new Date("2024-07-01T09:00:00Z"),
    updatedAt: new Date("2024-07-01T09:30:00Z"),
    publishedAt: new Date("2024-07-01T09:30:00Z"),
    attachmentUrl: "https://placehold.co/pdf-document.pdf", // Placeholder for PDF link
  },
  {
    id: "dec2",
    title: "Délibération du conseil n°2024-015: Budget primitif 2025",
    content: "Le conseil municipal, après en avoir délibéré, adopte le budget primitif pour l'exercice 2025 tel que présenté par la commission des finances.",
    summary: "Adoption du budget primitif pour l'année 2025.",
    categories: ["Décisions Municipales", "Finance"],
    tags: ["délibération", "budget", "conseil municipal"],
    status: "draft",
    decisionDate: new Date("2024-07-15T00:00:00Z"),
    referenceNumber: "DEL-2024-015",
    createdAt: new Date("2024-07-05T14:00:00Z"),
    updatedAt: new Date("2024-07-05T14:00:00Z"),
  },
];

export async function createDecision(data: Omit<Decision, "id" | "createdAt" | "updatedAt">): Promise<Decision | { error: string }> {
  try {
    const newDecision: Decision = {
      ...data,
      id: String(Date.now() + Math.random()),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    if (newDecision.status === 'published' && !newDecision.publishedAt) {
      newDecision.publishedAt = new Date();
    }
    decisions.unshift(newDecision);
    revalidatePath("/admin/decisions");
    revalidatePath("/admin/dashboard"); 
    return newDecision;
  } catch (error) {
    console.error("Error creating decision:", error);
    return { error: "Failed to create decision." };
  }
}

export async function getDecisions(): Promise<Decision[]> {
  return Promise.resolve(decisions.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
}

export async function getDecisionById(id: string): Promise<Decision | undefined> {
  return Promise.resolve(decisions.find(decision => decision.id === id));
}

export async function updateDecision(id: string, data: Partial<Omit<Decision, "id" | "createdAt" | "updatedAt">>): Promise<Decision | { error: string }> {
  try {
    const decisionIndex = decisions.findIndex(decision => decision.id === id);
    if (decisionIndex === -1) {
      return { error: "Decision not found." };
    }
    const existingDecision = decisions[decisionIndex];
    
    const updatedDecisionData: Partial<Decision> = {
      ...data,
      updatedAt: new Date(),
    };

    if (data.status === "published" && existingDecision.status !== "published") {
      updatedDecisionData.publishedAt = new Date();
    }
    
    const updatedDecision: Decision = {
      ...existingDecision,
      ...updatedDecisionData,
    };
    
    decisions[decisionIndex] = updatedDecision;
    revalidatePath("/admin/decisions");
    revalidatePath(`/admin/decisions/edit/${id}`);
    revalidatePath("/admin/dashboard");
    return updatedDecision;
  } catch (error) {
    console.error("Error updating decision:", error);
    return { error: "Failed to update decision." };
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
  } catch (error) {
    console.error("Error deleting decision:", error);
    return { success: false, error: "Failed to delete decision." };
  }
}
