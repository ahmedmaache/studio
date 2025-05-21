// src/lib/actions/auth.ts
"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { AdminRole } from "@prisma/client";

const AdminRegisterSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
  name: z.string().min(2, "Name must be at least 2 characters long.").optional(),
  role: z.nativeEnum(AdminRole).default(AdminRole.EDITOR),
});

type AdminRegisterInput = z.infer<typeof AdminRegisterSchema>;

export async function secureAdminRegister(input: AdminRegisterInput): Promise<{ success: boolean; error?: string; data?: { id: string; email: string; name: string | null, role: AdminRole } }> {
  try {
    const validation = AdminRegisterSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.errors.map(e => e.message).join(", ") };
    }

    const { email, password, name, role } = validation.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "An administrator with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        name,
        role,
      },
    });

    return { 
      success: true, 
      data: { 
        id: newUser.id, 
        email: newUser.email, 
        name: newUser.name,
        role: newUser.role 
      } 
    };
  } catch (error) {
    console.error("Error during admin registration:", error);
    // Check for specific Prisma errors if needed, e.g., P2002 for unique constraint
    if (error instanceof Error && (error as any).code === 'P2002') {
        return { success: false, error: "An administrator with this email already exists (database constraint)." };
    }
    return { success: false, error: "An unexpected error occurred during registration." };
  }
}
