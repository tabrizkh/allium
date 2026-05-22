"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSliderItem(formData: FormData) {
  const title = formData.get("title") as string;
  const title_en = formData.get("title_en") as string;
  const title_az = formData.get("title_az") as string;
  const subtitle = formData.get("subtitle") as string;
  const subtitle_en = formData.get("subtitle_en") as string;
  const subtitle_az = formData.get("subtitle_az") as string;
  const description = formData.get("description") as string;
  const description_en = formData.get("description_en") as string;
  const description_az = formData.get("description_az") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const buttonText = formData.get("buttonText") as string;
  const buttonText_en = formData.get("buttonText_en") as string;
  const buttonText_az = formData.get("buttonText_az") as string;
  const buttonLink = formData.get("buttonLink") as string;

  if (!imageUrl) {
    return { error: "Image URL is required" };
  }

  try {
    await prisma.sliderItem.create({
      data: {
        title,
        title_en,
        title_az,
        subtitle,
        subtitle_en,
        subtitle_az,
        description,
        description_en,
        description_az,
        imageUrl,
        buttonText: buttonText || "Смотреть каталог",
        buttonText_en,
        buttonText_az,
        buttonLink: buttonLink || "/#catalog",
        isActive: true,
      },
    });
    revalidatePath("/admin/slider");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error creating slider item:", error);
    return { error: "Failed to create slider item" };
  }
}

export async function updateSliderItem(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const title_en = formData.get("title_en") as string;
  const title_az = formData.get("title_az") as string;
  const subtitle = formData.get("subtitle") as string;
  const subtitle_en = formData.get("subtitle_en") as string;
  const subtitle_az = formData.get("subtitle_az") as string;
  const description = formData.get("description") as string;
  const description_en = formData.get("description_en") as string;
  const description_az = formData.get("description_az") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const buttonText = formData.get("buttonText") as string;
  const buttonText_en = formData.get("buttonText_en") as string;
  const buttonText_az = formData.get("buttonText_az") as string;
  const buttonLink = formData.get("buttonLink") as string;

  try {
    const data: any = {
      title,
      title_en,
      title_az,
      subtitle,
      subtitle_en,
      subtitle_az,
      description,
      description_en,
      description_az,
      buttonText: buttonText || "Смотреть каталог",
      buttonText_en,
      buttonText_az,
      buttonLink: buttonLink || "/#catalog",
    };
    if (imageUrl) {
      data.imageUrl = imageUrl;
    }

    await prisma.sliderItem.update({
      where: { id },
      data,
    });
    revalidatePath("/admin/slider");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating slider item:", error);
    return { error: "Failed to update slider item" };
  }
}

export async function deleteSliderItem(id: string) {
  try {
    await prisma.sliderItem.delete({
      where: { id },
    });
    revalidatePath("/admin/slider");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting slider item:", error);
    return { error: "Failed to delete slider item" };
  }
}

export async function toggleSliderActive(id: string, isActive: boolean) {
  try {
    await prisma.sliderItem.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/admin/slider");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error toggling slider active state:", error);
    return { error: "Failed to toggle slider state" };
  }
}
