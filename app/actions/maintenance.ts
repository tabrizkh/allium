'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const ADMIN_PASSWORD = process.env.MAINTENANCE_PASSWORD || 'Allium1380';

export async function checkMaintenanceMode() {
  try {
    const settings = await prisma.globalSettings.findUnique({
      where: { id: 'singleton' }
    });
    return settings?.maintenanceMode || false;
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    return false;
  }
}

export async function toggleMaintenanceMode(enabled: boolean) {
  try {
    await prisma.globalSettings.upsert({
      where: { id: 'singleton' },
      update: { maintenanceMode: enabled },
      create: { id: 'singleton', maintenanceMode: enabled }
    });
    return { success: true };
  } catch (error) {
    console.error('Error toggling maintenance mode:', error);
    return { success: false, error: 'Failed to toggle maintenance mode' };
  }
}

export async function bypassMaintenance(password: string) {
  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set('allium_admin_bypass', 'true', {
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    return { success: true };
  }
  return { success: false };
}

export async function isAdminBypassed() {
  const cookieStore = await cookies();
  return cookieStore.has('allium_admin_bypass');
}
