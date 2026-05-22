"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const name_en = formData.get("name_en") as string;
  const name_az = formData.get("name_az") as string;
  const slug = formData.get("slug") as string;
  const image = formData.get("image") as string;

  if (!name || !slug) {
    return { error: "Заполните все обязательные поля" };
  }

  try {
    await prisma.category.create({
      data: {
        name,
        name_en,
        name_az,
        slug,
        image: image || null,
      },
    });
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error creating category:", error);
    return { error: "Ошибка при создании категории (возможно, slug уже занят)" };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const name_en = formData.get("name_en") as string;
  const name_az = formData.get("name_az") as string;
  const slug = formData.get("slug") as string;
  const image = formData.get("image") as string;

  if (!name || !slug) {
    return { error: "Заполните все обязательные поля" };
  }

  try {
    await prisma.category.update({
      where: { id },
      data: {
        name,
        name_en,
        name_az,
        slug,
        image: image || null,
      },
    });
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating category:", error);
    return { error: "Ошибка при обновлении категории" };
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({
      where: { id },
    });
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { error: "Ошибка при удалении категории" };
  }
}
