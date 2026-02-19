"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function uploadFile(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) {
    return { error: "No file uploaded" };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Ensure directory exists
  const uploadDir = join(process.cwd(), "public", "uploads");
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (e) {
    // Ignore error if directory exists
  }

  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, ""); // Sanitize filename
  const finalFilename = `${uniqueSuffix}-${filename}`;
  const path = join(uploadDir, finalFilename);

  try {
    await writeFile(path, buffer);
    return { url: `/uploads/${finalFilename}` };
  } catch (error) {
    console.error("Error saving file:", error);
    return { error: "Error saving file" };
  }
}
