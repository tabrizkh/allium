"use client";

import { useState } from "react";
import { createSliderItem, deleteSliderItem, updateSliderItem, toggleSliderActive } from "@/app/actions/slider";
import { uploadFile } from "@/app/actions/upload";
import { Trash2, Plus, X, Upload, Edit, Play, Pause } from "lucide-react";
import Image from "next/image";

type SliderItem = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
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

export default function SliderList({ items }: { items: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const openCreateModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: SliderItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить этот слайд?")) {
      await deleteSliderItem(id);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    await toggleSliderActive(id, !currentStatus);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление слайдером</h1>
        <button
          onClick={openCreateModal}
          className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition"
        >
          <Plus size={20} />
          Добавить слайд
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition ${!item.isActive ? 'opacity-60 grayscale-[0.5]' : ''}`}>
            <div className="relative aspect-[16/9] bg-gray-100">
              <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
              {!item.isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="bg-white/90 text-black text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">Скрыто</div>
                </div>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1 truncate">{item.title}</h3>
                {item.subtitle && <p className="text-sm text-gray-500 mb-2 truncate">{item.subtitle}</p>}
                <p className="text-xs text-gray-400 line-clamp-2 mb-4">{item.description}</p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(item.id, item.isActive)}
                    title={item.isActive ? "Скрыть из показа" : "Показать на сайте"}
                    className={`${item.isActive ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'} p-2 rounded-xl transition`}
                  >
                    {item.isActive ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button
                    onClick={() => openEditModal(item)}
                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-2 rounded-xl transition"
                  >
                    <Edit size={18} />
                  </button>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-xl transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {items.length === 0 && (
          <button 
            onClick={openCreateModal}
            className="col-span-full py-20 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 transition gap-3"
          >
            <Plus size={40} />
            <span className="font-medium text-lg">Добавить первый слайд</span>
          </button>
        )}
      </div>

      {isModalOpen && (
        <SliderModal
          item={editingItem}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

function SliderModal({ item, onClose }: { item: any | null, onClose: () => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [activeLang, setActiveLang] = useState("ru");
  const [preview, setPreview] = useState<string | null>(item?.imageUrl || null);
  
  const [titles, setTitles] = useState({ ru: item?.title || "", en: item?.title_en || "", az: item?.title_az || "" });
  const [subtitles, setSubtitles] = useState({ ru: item?.subtitle || "", en: item?.subtitle_en || "", az: item?.subtitle_az || "" });
  const [descriptions, setDescriptions] = useState({ ru: item?.description || "", en: item?.description_en || "", az: item?.description_az || "" });
  const [buttonTexts, setButtonTexts] = useState({ ru: item?.buttonText || "Смотреть каталог", en: item?.buttonText_en || "View catalog", az: item?.buttonText_az || "Kataloqa bax" });

  async function handleSubmit(formData: FormData) {
    setIsUploading(true);
    
    formData.set("title", titles.ru);
    formData.set("title_en", titles.en);
    formData.set("title_az", titles.az);
    formData.set("subtitle", subtitles.ru);
    formData.set("subtitle_en", subtitles.en);
    formData.set("subtitle_az", subtitles.az);
    formData.set("description", descriptions.ru);
    formData.set("description_en", descriptions.en);
    formData.set("description_az", descriptions.az);
    formData.set("buttonText", buttonTexts.ru);
    formData.set("buttonText_en", buttonTexts.en);
    formData.set("buttonText_az", buttonTexts.az);
    
    const file = formData.get("file") as File;
    let imageUrl = item?.imageUrl;

    if (file && file.size > 0) {
      const uploadResult = await uploadFile(formData);
      if (uploadResult.error) {
        alert(uploadResult.error);
        setIsUploading(false);
        return;
      }
      imageUrl = uploadResult.url!;
    } else if (!item) {
        alert("Выберите изображение");
        setIsUploading(false);
        return;
    }

    if (imageUrl) {
      formData.set("imageUrl", imageUrl);
    }

    const result = item 
      ? await updateSliderItem(item.id, formData)
      : await createSliderItem(formData);

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
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-8">{item ? "Редактировать слайд" : "Новый слайд"}</h2>
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Заголовок (H1) ({activeLang.toUpperCase()})</label>
              <LanguageTabs activeLang={activeLang} onChange={setActiveLang} />
              <input
                value={titles[activeLang as keyof typeof titles]}
                onChange={(e) => setTitles({ ...titles, [activeLang]: e.target.value })}
                required={activeLang === 'ru'}
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[var(--accent)] outline-none transition"
                placeholder="Например, Букеты недели"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Подзаголовок ({activeLang.toUpperCase()})</label>
              <input
                value={subtitles[activeLang as keyof typeof subtitles]}
                onChange={(e) => setSubtitles({ ...subtitles, [activeLang]: e.target.value })}
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[var(--accent)] outline-none transition"
                placeholder="Например, Нежные композиции со скидкой"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Описание ({activeLang.toUpperCase()})</label>
              <textarea
                value={descriptions[activeLang as keyof typeof descriptions]}
                onChange={(e) => setDescriptions({ ...descriptions, [activeLang]: e.target.value })}
                rows={3}
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[var(--accent)] outline-none transition resize-none"
                placeholder="Текст на слайде..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Текст кнопки ({activeLang.toUpperCase()})</label>
                <input
                  value={buttonTexts[activeLang as keyof typeof buttonTexts]}
                  onChange={(e) => setButtonTexts({ ...buttonTexts, [activeLang]: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[var(--accent)] outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ссылка кнопки</label>
                <input
                  name="buttonLink"
                  defaultValue={item?.buttonLink || "/#catalog"}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[var(--accent)] outline-none transition"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Изображение</label>
              <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:bg-gray-50 transition cursor-pointer min-h-[200px] flex items-center justify-center overflow-hidden">
                <input 
                  type="file" 
                  name="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  required={!item}
                />
                {preview ? (
                  <div className="relative w-full h-full aspect-[16/9] rounded-lg overflow-hidden">
                    <Image src={preview} alt="Preview" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-gray-400 pointer-events-none">
                    <Upload size={40} className="mb-3" />
                    <span className="font-medium text-sm text-gray-500">Нажмите для загрузки фото</span>
                    <span className="text-xs text-gray-400 mt-1">Рекомендуется 1200x600px</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-8 py-3 bg-[var(--accent)] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-[var(--accent)]/20"
            >
              {isUploading ? "Загрузка..." : (item ? "Сохранить" : "Создать")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
