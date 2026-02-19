"use client";

import { useState } from "react";
import { uploadFile } from "@/app/actions/upload";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  disabled?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  multiple = false,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  // Derive urls from value prop
  const urls = Array.isArray(value) ? value : value ? [value] : [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      // Create an array of promises for parallel uploads
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadFile(formData);
        if (result.error) throw new Error(result.error);
        return result.url!;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      if (multiple) {
        onChange([...urls, ...uploadedUrls]);
      } else {
        // Single mode: take the last one
        const lastUrl = uploadedUrls[uploadedUrls.length - 1];
        if (lastUrl) onChange(lastUrl);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Something went wrong during upload");
    } finally {
      setIsUploading(false);
      // Reset input value to allow selecting the same file again
      e.target.value = "";
    }
  };

  const removeUrl = (urlToRemove: string) => {
    if (multiple) {
      onChange(urls.filter((url) => url !== urlToRemove));
    } else {
      onChange("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {urls.map((url) => (
          <div
            key={url}
            className="relative w-32 h-32 rounded-lg overflow-hidden border bg-gray-50 group"
          >
            <Image
              src={url}
              alt="Uploaded image"
              fill
              className="object-cover"
            />
            <button
              onClick={() => removeUrl(url)}
              type="button"
              className="absolute top-1 right-1 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white shadow-sm"
              disabled={disabled}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition cursor-pointer flex flex-col items-center justify-center min-h-[120px]">
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={disabled || isUploading}
        />
        {isUploading ? (
          <div className="flex flex-col items-center text-gray-500">
            <Loader2 size={32} className="animate-spin mb-2" />
            <span className="text-sm">Загрузка...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-500 pointer-events-none">
            <Upload size={32} className="mb-2" />
            <span className="text-sm">
              {multiple
                ? "Нажмите для загрузки изображений"
                : "Нажмите для загрузки изображения"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
