"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- Packaging Actions ---

export async function getPackaging() {
  return prisma.packaging.findMany({
    where: { isAvailable: true },
  });
}

export async function getAllPackaging() {
  return prisma.packaging.findMany();
}

export async function createPackaging(formData: FormData) {
  const name = formData.get("name") as string;
  const name_en = formData.get("name_en") as string;
  const name_az = formData.get("name_az") as string;
  const price = parseFloat(formData.get("price") as string);
  const image = formData.get("image") as string;
  const isAvailable = formData.get("isAvailable") === "on";
  const categoryId = formData.get("categoryId") as string;

  if (!name || isNaN(price) || !categoryId) {
    return { error: "Заполните все обязательные поля" };
  }

  await prisma.packaging.create({
    data: { 
      name, 
      name_en,
      name_az,
      price, 
      image, 
      isAvailable,
      categoryId
    },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function deletePackaging(id: string) {
  await prisma.packaging.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/admin/settings");
  return { success: true };
}

// --- Card Template Actions ---

export async function getCardTemplates(recipient?: string) {
  if (recipient) {
    return prisma.cardTemplate.findMany({
      where: { recipient },
    });
  }
  return prisma.cardTemplate.findMany();
}

export async function createCardTemplate(formData: FormData) {
  const text = formData.get("text") as string;
  const text_en = formData.get("text_en") as string;
  const text_az = formData.get("text_az") as string;
  const recipient = formData.get("recipient") as string;

  if (!text || !recipient) {
    return { error: "Missing fields" };
  }

  await prisma.cardTemplate.create({
    data: { text, text_en, text_az, recipient },
  });
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function deleteCardTemplate(id: string) {
  await prisma.cardTemplate.delete({ where: { id } });
  revalidatePath("/admin/settings");
  return { success: true };
}
