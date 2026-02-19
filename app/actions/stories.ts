"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createStory(formData: FormData) {
  const title = formData.get("title") as string;
  const mediaUrl = formData.get("mediaUrl") as string;
  const type = formData.get("type") as "image" | "video";

  if (!mediaUrl) {
    return { error: "Media URL is required" };
  }

  try {
    await prisma.story.create({
      data: {
        title,
        mediaUrl,
        type: type || "image",
        isActive: true,
      },
    });
    revalidatePath("/admin/stories");
    return { success: true };
  } catch (error) {
    console.error("Error creating story:", error);
    return { error: "Failed to create story" };
  }
}

export async function deleteStory(id: string) {
  try {
    await prisma.story.delete({
      where: { id },
    });
    revalidatePath("/admin/stories");
    return { success: true };
  } catch (error) {
    console.error("Error deleting story:", error);
    return { error: "Failed to delete story" };
  }
}
