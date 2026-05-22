"use client";

import { useState } from "react";
import { createStory, deleteStory, updateStory, toggleStoryActive } from "@/app/actions/stories";
import { uploadFile } from "@/app/actions/upload";
import { Trash2, Plus, X, Upload, Edit, Play, Pause } from "lucide-react";
import Image from "next/image";

type Story = {
  id: string;
  title: string | null;
  description: string | null;
  mediaUrl: string;
  type: string;
  isActive: boolean;
  categoryId: string | null;
  category?: { name: string } | null;
};

type Category = {
  id: string;
  name: string;
};

function LanguageTabs({ activeLang, onChange }: { activeLang: string; onChange: (lang: string) => void }) {
  return (
    <div className="flex bg-gray-100 p-1 rounded-lg w-fit mb-2">
      {['ru', 'en', 'az'].map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => onChange(lang)}
          className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
            activeLang === lang ? 'bg-white shadow-sm text-[var(--accent)]' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function StoryList({ stories, categories }: { stories: any[], categories: Category[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [targetCategoryId, setTargetCategoryId] = useState<string | null>(null);

  const openCreateModal = (categoryId: string | null = null) => {
    setEditingStory(null);
    setTargetCategoryId(categoryId);
    setIsModalOpen(true);
  };

  const openEditModal = (story: Story) => {
    setEditingStory(story);
    setTargetCategoryId(story.categoryId);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить эту сторис?")) {
      await deleteStory(id);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    await toggleStoryActive(id, !currentStatus);
  };

  // Group stories by category
  const storiesByCategory = categories.reduce((acc, cat) => {
    acc[cat.id] = stories.filter(s => s.categoryId === cat.id);
    return acc;
  }, {} as Record<string, Story[]>);

  // Stories without category
  const otherStories = stories.filter(s => !s.categoryId);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление сторис</h1>
      </div>

      <div className="space-y-12">
        {categories.map((category) => (
          <div key={category.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[var(--accent)]"></span>
                {category.name}
              </h2>
              <button
                onClick={() => openCreateModal(category.id)}
                className="text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition"
              >
                <Plus size={16} />
                Добавить
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {storiesByCategory[category.id]?.map((story) => (
                <StoryCard 
                  key={story.id} 
                  story={story} 
                  onEdit={() => openEditModal(story)} 
                  onDelete={() => handleDelete(story.id)} 
                  onToggleActive={() => handleToggleActive(story.id, story.isActive)}
                />
              ))}
              
              {(!storiesByCategory[category.id] || storiesByCategory[category.id].length === 0) && (
                <button 
                  onClick={() => openCreateModal(category.id)}
                  className="aspect-[9/16] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 transition gap-2"
                >
                  <Plus size={24} />
                  <span className="text-xs font-medium">Добавить сторис</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {otherStories.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 opacity-75">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-500">Без категории</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {otherStories.map((story) => (
                <StoryCard 
                  key={story.id} 
                  story={story} 
                  onEdit={() => openEditModal(story)} 
                  onDelete={() => handleDelete(story.id)} 
                  onToggleActive={() => handleToggleActive(story.id, story.isActive)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <StoryModal
          story={editingStory}
          categories={categories}
          defaultCategoryId={targetCategoryId}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

function StoryCard({ story, onEdit, onDelete, onToggleActive }: { story: Story, onEdit: () => void, onDelete: () => void, onToggleActive: () => void }) {
  return (
    <div className={`relative group aspect-[9/16] rounded-xl overflow-hidden bg-gray-100 border shadow-sm transition ${!story.isActive ? 'opacity-60 grayscale-[0.5]' : ''}`}>
      {story.type === "video" ? (
        <video src={story.mediaUrl} className="w-full h-full object-cover" muted />
      ) : (
        <div className="relative w-full h-full">
          <Image src={story.mediaUrl} alt={story.title || "Story"} fill className="object-cover" />
        </div>
      )}
      
      {!story.isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
          <div className="bg-white/90 text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Скрыто</div>
        </div>
      )}

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
        <p className="text-white text-xs font-medium truncate mb-2">{story.title || "Без названия"}</p>
        <div className="flex gap-2 self-end">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleActive(); }}
            title={story.isActive ? "Скрыть из показа" : "Показать на сайте"}
            className={`${story.isActive ? 'bg-white/20 hover:bg-yellow-500/80' : 'bg-green-500/80 hover:bg-green-600'} text-white p-1.5 rounded-full backdrop-blur-sm transition`}
          >
            {story.isActive ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="bg-white/20 hover:bg-white/40 text-white p-1.5 rounded-full backdrop-blur-sm transition"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="bg-white/20 hover:bg-red-500/80 text-white p-1.5 rounded-full backdrop-blur-sm transition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function StoryModal({ story, categories, defaultCategoryId, onClose }: { story: any | null, categories: Category[], defaultCategoryId: string | null, onClose: () => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [activeLang, setActiveLang] = useState("ru");
  const [preview, setPreview] = useState<string | null>(story?.mediaUrl || null);
  const [fileType, setFileType] = useState<string>(story?.type || "image");
  
  const [titles, setTitles] = useState({ ru: story?.title || "", en: story?.title_en || "", az: story?.title_az || "" });
  const [descriptions, setDescriptions] = useState({ ru: story?.description || "", en: story?.description_en || "", az: story?.description_az || "" });

  async function handleSubmit(formData: FormData) {
    setIsUploading(true);
    
    formData.set("title", titles.ru);
    formData.set("title_en", titles.en);
    formData.set("title_az", titles.az);
    formData.set("description", descriptions.ru);
    formData.set("description_en", descriptions.en);
    formData.set("description_az", descriptions.az);
    
    const file = formData.get("file") as File;
    let mediaUrl = story?.mediaUrl;

    if (file && file.size > 0) {
      const uploadResult = await uploadFile(formData);
      if (uploadResult.error) {
        alert(uploadResult.error);
        setIsUploading(false);
        return;
      }
      mediaUrl = uploadResult.url!;
      formData.set("type", file.type.startsWith("video") ? "video" : "image");
    } else if (!story) {
        alert("Выберите файл");
        setIsUploading(false);
        return;
    }

    if (mediaUrl) {
      formData.set("mediaUrl", mediaUrl);
    }

    const result = story 
      ? await updateStory(story.id, formData)
      : await createStory(formData);

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
        <h2 className="text-xl font-bold mb-6">{story ? "Редактировать сторис" : "Новая сторис"}</h2>
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
            <select
              name="categoryId"
              defaultValue={story?.categoryId || defaultCategoryId || ""}
              className="w-full border rounded-lg p-2 bg-white"
            >
              <option value="">Без категории (общая)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок ({activeLang.toUpperCase()})</label>
            <LanguageTabs activeLang={activeLang} onChange={setActiveLang} />
            <input
              value={titles[activeLang as keyof typeof titles]}
              onChange={(e) => setTitles({ ...titles, [activeLang]: e.target.value })}
              className="w-full border rounded-lg p-2"
              placeholder="Например, Акция"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание (Subline) ({activeLang.toUpperCase()})</label>
            <input
              value={descriptions[activeLang as keyof typeof descriptions]}
              onChange={(e) => setDescriptions({ ...descriptions, [activeLang]: e.target.value })}
              className="w-full border rounded-lg p-2"
              placeholder="Например, Свежие композиции"
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
                required={!story}
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
              {isUploading ? "Загрузка..." : (story ? "Сохранить" : "Создать")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
