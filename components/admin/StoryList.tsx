"use client";

import { useState } from "react";
import { createStory, deleteStory } from "@/app/actions/stories";
import { uploadFile } from "@/app/actions/upload";
import { Trash2, Plus, X, Upload } from "lucide-react";
import Image from "next/image";

type Story = {
  id: string;
  title: string | null;
  mediaUrl: string;
  type: string;
  isActive: boolean;
};

export default function StoryList({ stories }: { stories: Story[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDelete = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить эту сторис?")) {
      await deleteStory(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Сторис</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition"
        >
          <Plus size={20} />
          Добавить сторис
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {stories.map((story) => (
          <div key={story.id} className="relative group aspect-[9/16] rounded-xl overflow-hidden bg-gray-100 border shadow-sm">
            {story.type === "video" ? (
              <video src={story.mediaUrl} className="w-full h-full object-cover" muted loop />
            ) : (
              <div className="relative w-full h-full">
                <Image src={story.mediaUrl} alt={story.title || "Story"} fill className="object-cover" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              <p className="text-white text-sm font-medium truncate mb-2">{story.title || "Без названия"}</p>
              <button
                onClick={() => handleDelete(story.id)}
                className="bg-white/20 hover:bg-red-500/80 text-white p-2 rounded-full backdrop-blur-sm transition self-end"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {stories.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed">
            Сторис пока нет
          </div>
        )}
      </div>

      {isModalOpen && (
        <StoryModal
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

function StoryModal({ onClose }: { onClose: () => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video">("image");

  async function handleSubmit(formData: FormData) {
    setIsUploading(true);
    
    // First upload the file
    const file = formData.get("file") as File;
    if (file && file.size > 0) {
      const uploadResult = await uploadFile(formData);
      if (uploadResult.error) {
        alert(uploadResult.error);
        setIsUploading(false);
        return;
      }
      // Replace file with URL in a new FormData or modify logic
      // Since createStory expects mediaUrl, we need to pass it.
      // We can call createStory with a new FormData or just pass parameters.
      // But server actions take FormData.
      
      formData.set("mediaUrl", uploadResult.url!);
      formData.set("type", file.type.startsWith("video") ? "video" : "image");
    } else {
        alert("Выберите файл");
        setIsUploading(false);
        return;
    }

    const result = await createStory(formData);
    if (result.error) {
      alert(result.error);
    }
    setIsUploading(false);
    onClose();
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setFileType(file.type.startsWith("video") ? "video" : "image");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold mb-6">Новая сторис</h2>
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок (необязательно)</label>
            <input
              name="title"
              className="w-full border rounded-lg p-2"
              placeholder="Например, Акция"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Медиа файл</label>
            <div className="relative border-2 border-dashed rounded-xl p-8 text-center hover:bg-gray-50 transition cursor-pointer min-h-[200px] flex items-center justify-center">
              <input 
                type="file" 
                name="file" 
                accept="image/*,video/*" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                required
              />
              {preview ? (
                <div className="relative aspect-[9/16] w-32 mx-auto rounded-lg overflow-hidden bg-black">
                  {fileType === "video" ? (
                    <video src={preview} className="w-full h-full object-cover" muted />
                  ) : (
                    <div className="relative w-full h-full">
                      <Image src={preview} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-400 pointer-events-none">
                  <Upload size={32} className="mb-2" />
                  <span className="text-sm">Нажмите для загрузки</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {isUploading ? "Загрузка..." : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
