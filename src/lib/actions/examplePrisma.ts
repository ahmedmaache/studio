// src/lib/actions/examplePrisma.ts
'use server';

import prisma from '@/lib/prisma';

export async function getAllAdminUsers() {
  try {
    const adminUsers = await prisma.adminUser.findMany();
    console.log('Fetched Admin Users:', adminUsers);
    return { success: true, data: adminUsers };
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return { success: false, error: 'Failed to fetch admin users.' };
  }
}

export async function countTotalAnnouncements() {
  try {
    const count = await prisma.announcement.count();
    console.log('Total announcements count from DB:', count);
    return { success: true, data: count };
  } catch (error) {
    console.error('Error counting announcements:', error);
    return { success: false, error: 'Failed to count announcements.' };
  }
}

// Example of how to create a simple admin user if needed for initial setup.
// Be cautious with using this directly in production without proper security.
export async function createTestAdmin(email: string, pass: string, name?: string) {
  // In a real app, you'd hash the password securely.
  // This is a simplified example.
  // const hashedPassword = await bcrypt.hash(pass, 10); // Example using bcrypt
  if (process.env.NODE_ENV !== 'development') {
    return { success: false, error: "Test admin creation is only allowed in development."}
  }
  try {
    const admin = await prisma.adminUser.create({
      data: {
        email,
        hashedPassword: `hashed_${pass}`, // IMPORTANT: Replace with actual password hashing
        name: name || 'Test Admin',
        role: 'SUPER_ADMIN',
      },
    });
    console.log('Test admin created:', admin);
    return { success: true, data: admin };
  } catch (error: any) {
    console.error('Error creating test admin:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return { success: false, error: 'Email already exists.' };
    }
    return { success: false, error: 'Failed to create test admin.' };
  }
}
