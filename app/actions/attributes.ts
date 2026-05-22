"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createAttribute(categoryId: string, name: string) {
  try {
    await prisma.attribute.create({
      data: {
        name,
        categoryId,
      },
    });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Error creating attribute:", error);
    return { error: "Failed to create attribute" };
  }
}

export async function updateAttribute(id: string, name: string) {
  try {
    await prisma.attribute.update({
      where: { id },
      data: { name },
    });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Error updating attribute:", error);
    return { error: "Failed to update attribute" };
  }
}

export async function deleteAttribute(id: string) {
  try {
    await prisma.attribute.delete({
      where: { id },
    });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Error deleting attribute:", error);
    return { error: "Failed to delete attribute" };
  }
}

export async function createAttributeOption(attributeId: string, name: string) {
  try {
    await prisma.attributeOption.create({
      data: {
        name,
        attributeId,
      },
    });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Error creating attribute option:", error);
    return { error: "Failed to create option" };
  }
}

export async function deleteAttributeOption(id: string) {
  try {
    await prisma.attributeOption.delete({
      where: { id },
    });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Error deleting attribute option:", error);
    return { error: "Failed to delete option" };
  }
}
