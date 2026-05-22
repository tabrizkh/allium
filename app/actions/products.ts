"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const name_en = formData.get("name_en") as string;
  const name_az = formData.get("name_az") as string;
  const slug = formData.get("slug") as string;
  const price = parseFloat(formData.get("price") as string);
  const oldPrice = formData.get("oldPrice") ? parseFloat(formData.get("oldPrice") as string) : null;
  const categoryId = formData.get("categoryId") as string;
  const description = formData.get("description") as string;
  const description_en = formData.get("description_en") as string;
  const description_az = formData.get("description_az") as string;
  const images = formData.get("images") as string; // JSON string
  const recipients = formData.get("recipients") as string; // JSON string
  const occasions = formData.get("occasions") as string; // JSON string
  const productOptions = formData.get("productOptions") as string; // JSON string
  const isPopular = formData.get("isPopular") === "on";
  const isTrending = formData.get("isTrending") === "on";
  const inStock = formData.get("inStock") === "on";

  if (!name || !slug || !price || !categoryId) {
    return { error: "Заполните все обязательные поля" };
  }

  try {
    await prisma.product.create({
      data: {
        name,
        name_en,
        name_az,
        slug,
        price,
        oldPrice,
        categoryId,
        description,
        description_en,
        description_az,
        images: images || "[]",
        recipients: recipients || "[]",
        occasions: occasions || "[]",
        productOptions: productOptions || "{}",
        isPopular,
        isTrending,
        inStock,
      },
    });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error creating product:", error);
    return { error: "Ошибка при создании товара" };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const name_en = formData.get("name_en") as string;
  const name_az = formData.get("name_az") as string;
  const slug = formData.get("slug") as string;
  const price = parseFloat(formData.get("price") as string);
  const oldPrice = formData.get("oldPrice") ? parseFloat(formData.get("oldPrice") as string) : null;
  const categoryId = formData.get("categoryId") as string;
  const description = formData.get("description") as string;
  const description_en = formData.get("description_en") as string;
  const description_az = formData.get("description_az") as string;
  const images = formData.get("images") as string;
  const recipients = formData.get("recipients") as string;
  const occasions = formData.get("occasions") as string;
  const productOptions = formData.get("productOptions") as string;
  const isPopular = formData.get("isPopular") === "on";
  const isTrending = formData.get("isTrending") === "on";
  const inStock = formData.get("inStock") === "on";

  if (!name || !slug || !price || !categoryId) {
    return { error: "Заполните все обязательные поля" };
  }

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name,
        name_en,
        name_az,
        slug,
        price,
        oldPrice,
        categoryId,
        description,
        description_en,
        description_az,
        images: images || "[]",
        recipients: recipients || "[]",
        occasions: occasions || "[]",
        productOptions: productOptions || "{}",
        isPopular,
        isTrending,
        inStock,
      },
    });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error updating product:", error);
    return { error: "Ошибка при обновлении товара" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { error: "Ошибка при удалении товара" };
  }
}

export async function toggleTrending(id: string, isTrending: boolean) {
  try {
    await prisma.product.update({
      where: { id },
      data: { isTrending },
    });
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error toggling trending:", error);
    return { error: "Ошибка при обновлении статуса трендов" };
  }
}
