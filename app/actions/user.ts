"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function toggleFavoriteAction(productId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
    } else {
      await prisma.favorite.create({
        data: {
          userId: session.user.id,
          productId,
        },
      });
    }
    
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return { success: false, error: "Failed to update favorite" };
  }
}

export async function getFavoritesAction() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  });

  return favorites;
}

export async function saveAddressAction(addressData: {
  name: string;
  phone: string;
  address: string;
  city: string;
  comment?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Not authenticated" };

    try {
        await prisma.address.create({
            data: {
                userId: session.user.id,
                ...addressData
            }
        });
        revalidatePath("/profile");
        return { success: true };
    } catch (error) {
        console.error("Error saving address:", error);
        return { success: false, error: "Failed to save address" };
    }
}

export async function getUserAddresses() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await prisma.address.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
    });
}

export async function updateProfile(data: { name?: string; phone?: string }) {
    const session = await auth();
    if (!session?.user?.id) return { success: false };

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: data.name,
                phone: data.phone
            }
        });
        revalidatePath("/profile");
        return { success: true };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false };
    }
}

export async function syncGuestOrders(email: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  try {
    // Find orders that match the user's email but don't have a userId
    await prisma.order.updateMany({
      where: {
        email: email,
        userId: null
      },
      data: {
        userId: session.user.id
      }
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Error syncing guest orders:", error);
    return { success: false };
  }
}
