"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createReview(productId: string, rating: number, text: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Вы должны быть авторизованы, чтобы оставить отзыв" };
    }

    // Проверяем существование пользователя в БД перед созданием отзыва
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!dbUser) {
      return { error: `Пользователь с ID ${session.user.id} не найден в базе данных. Попробуйте перезайти в аккаунт.` };
    }

    await prisma.review.create({
      data: {
        productId,
        userId: dbUser.id,
        rating: Number(rating),
        text: String(text),
        status: "PENDING",
      },
    });

    revalidatePath(`/admin/reviews`);
    return { success: true, message: "Отзыв отправлен на модерацию" };
  } catch (error: any) {
    console.error("Error creating review:", error);
    return { error: `Ошибка при создании отзыва: ${error.message || "Неизвестная ошибка"}` };
  }
}

export async function updateReviewStatus(id: string, status: "APPROVED" | "REJECTED" | "PENDING") {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return { error: "У вас нет прав для этого действия" };
    }

    await prisma.review.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error) {
    console.error("Error updating review status:", error);
    return { error: "Ошибка при обновлении статуса отзыва" };
  }
}

export async function deleteReview(id: string) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return { error: "У вас нет прав для этого действия" };
    }

    await prisma.review.delete({
      where: { id },
    });

    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error) {
    console.error("Error deleting review:", error);
    return { error: "Ошибка при удалении отзыва" };
  }
}

export async function getAdminReviews() {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: true,
        product: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return reviews;
  } catch (error) {
    console.error("Error fetching admin reviews:", error);
    return [];
  }
}
