"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createStory(formData: FormData) {
  const title = formData.get("title") as string;
  const title_en = formData.get("title_en") as string;
  const title_az = formData.get("title_az") as string;
  const description = formData.get("description") as string;
  const description_en = formData.get("description_en") as string;
  const description_az = formData.get("description_az") as string;
  const mediaUrl = formData.get("mediaUrl") as string;
  const type = formData.get("type") as "image" | "video";
  const categoryId = formData.get("categoryId") as string;

  if (!mediaUrl) {
    return { error: "Media URL is required" };
  }

  try {
    await prisma.story.create({
      data: {
        title,
        title_en,
        title_az,
        description,
        description_en,
        description_az,
        mediaUrl,
        type: type || "image",
        isActive: true,
        categoryId: categoryId || null,
      },
    });
    revalidatePath("/admin/stories");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error creating story:", error);
    return { error: "Failed to create story" };
  }
}

export async function updateStory(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const title_en = formData.get("title_en") as string;
  const title_az = formData.get("title_az") as string;
  const description = formData.get("description") as string;
  const description_en = formData.get("description_en") as string;
  const description_az = formData.get("description_az") as string;
  const mediaUrl = formData.get("mediaUrl") as string;
  const type = formData.get("type") as "image" | "video";
  const categoryId = formData.get("categoryId") as string;

  try {
    const data: any = {
      title,
      title_en,
      title_az,
      description,
      description_en,
      description_az,
      type: type || "image",
      categoryId: categoryId || null,
    };
    if (mediaUrl) {
      data.mediaUrl = mediaUrl;
    }

    await prisma.story.update({
      where: { id },
      data,
    });
    revalidatePath("/admin/stories");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating story:", error);
    return { error: "Failed to update story" };
  }
}

export async function deleteStory(id: string) {
  try {
    await prisma.story.delete({
      where: { id },
    });
    revalidatePath("/admin/stories");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting story:", error);
    return { error: "Failed to delete story" };
  }
}

export async function toggleStoryActive(id: string, isActive: boolean) {
  try {
    await prisma.story.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/admin/stories");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error toggling story active state:", error);
    return { error: "Failed to toggle story state" };
  }
}
