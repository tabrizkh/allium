"use client";

import { useState } from "react";
import { createPackaging, deletePackaging, createCardTemplate, deleteCardTemplate } from "@/app/actions/addons";
import { Trash2, Plus } from "lucide-react";
import Image from "next/image";
import ImageUpload from "@/components/admin/ImageUpload";

type CardTemplate = {
  id: string;
  text: string;
  recipient: string;
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

export default function SettingsPage({
  cardTemplates,
}: {
  cardTemplates: any[];
}) {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-2xl font-bold mb-6">Шаблоны открыток</h2>
        <CardTemplateList initialData={cardTemplates} />
      </section>
    </div>
  );
}

function CardTemplateList({ initialData }: { initialData: any[] }) {
  const [isCreating, setIsCreating] = useState(false);
  const [activeLang, setActiveLang] = useState("ru");
  const [texts, setTexts] = useState({
    ru: "",
    en: "",
    az: "",
  });

  const recipients = ["mom", "wife", "friend", "colleague", "daughter", "sister", "girl", "husband"];

  const handleCreate = async (formData: FormData) => {
    formData.set("text", texts.ru);
    formData.set("text_en", texts.en);
    formData.set("text_az", texts.az);
    
    await createCardTemplate(formData);
    setIsCreating(false);
    setTexts({ ru: "", en: "", az: "" });
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {initialData.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-xl border shadow-sm flex gap-4 justify-between group">
            <div>
              <div className="text-xs font-bold text-[var(--accent)] uppercase mb-1">{item.recipient}</div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.text}</p>
            </div>
            <button
              onClick={() => deleteCardTemplate(item.id)}
              className="text-red-500 opacity-0 group-hover:opacity-100 transition p-2"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => setIsCreating(true)}
        className="flex items-center gap-2 text-[var(--accent)] hover:underline mb-4"
      >
        <Plus size={18} />
        Добавить шаблон
      </button>

      {isCreating && (
        <form action={handleCreate} 
          className="bg-white p-6 rounded-xl border max-w-md space-y-4"
        >
          <h3 className="font-bold text-lg">Новый шаблон</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Для кого</label>
            <select name="recipient" className="w-full border p-2 rounded-lg bg-white">
              {recipients.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Текст поздравления ({activeLang.toUpperCase()})</label>
            <LanguageTabs activeLang={activeLang} onChange={setActiveLang} />
            <textarea 
              value={texts[activeLang as keyof typeof texts]}
              onChange={(e) => setTexts({ ...texts, [activeLang]: e.target.value })}
              required={activeLang === 'ru'}
              rows={4} 
              className="w-full border p-2 rounded-lg" 
              placeholder="Поздравляю..." 
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-500">Отмена</button>
            <button type="submit" className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg">Создать</button>
          </div>
        </form>
      )}
    </div>
  );
}
