"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, bucketName } from "@/lib/s3";

export async function uploadFile(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) {
    return { error: "No file uploaded" };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, ""); // Sanitize filename
  const finalFilename = `${uniqueSuffix}-${filename}`;

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: `uploads/${finalFilename}`,
      Body: buffer,
      ContentType: file.type,
      ACL: "public-read", // Re-enabled because user enabled ACLs in S3 settings
    });

    await s3Client.send(command);

    // Construct the public URL
    const region = process.env.AWS_REGION || "us-east-1";
    const url = `https://${bucketName}.s3.${region}.amazonaws.com/uploads/${finalFilename}`;

    return { url };
  } catch (error: any) {
    console.error("Error uploading to S3:", error);
    return { error: `S3 Upload Error: ${error.message || "Unknown error"}` };
  }
}
