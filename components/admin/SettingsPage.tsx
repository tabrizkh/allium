"use client";

import { useState } from "react";
import { createPackaging, deletePackaging, createCardTemplate, deleteCardTemplate } from "@/app/actions/addons";
import { Trash2, Plus } from "lucide-react";
import Image from "next/image";
import ImageUpload from "@/components/admin/ImageUpload";

type Packaging = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  isAvailable: boolean;
};

type CardTemplate = {
  id: string;
  text: string;
  recipient: string;
};

export default function SettingsPage({
  packaging,
  cardTemplates,
}: {
  packaging: Packaging[];
  cardTemplates: CardTemplate[];
}) {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-2xl font-bold mb-6">Упаковка</h2>
        <PackagingList initialData={packaging} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Шаблоны открыток</h2>
        <CardTemplateList initialData={cardTemplates} />
      </section>
    </div>
  );
}

function PackagingList({ initialData }: { initialData: Packaging[] }) {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {initialData.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-xl border shadow-sm flex gap-4">
            <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
            </div>
            <div className="flex-1">
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-gray-500">{item.price} ₼</div>
              <div className={`text-xs mt-1 ${item.isAvailable ? "text-green-600" : "text-red-500"}`}>
                {item.isAvailable ? "Доступно" : "Нет в наличии"}
              </div>
            </div>
            <button
              onClick={() => deletePackaging(item.id)}
              className="text-red-500 hover:bg-red-50 p-2 rounded-lg self-start"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        
        <button
          onClick={() => setIsCreating(true)}
          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-400 hover:border-[var(--accent)] hover:text-[var(--accent)] transition h-full min-h-[120px]"
        >
          <Plus size={24} />
          <span>Добавить упаковку</span>
        </button>
      </div>

      {isCreating && (
        <form action={async (formData) => {
            await createPackaging(formData);
            setIsCreating(false);
          }} 
          className="bg-white p-6 rounded-xl border max-w-md space-y-4"
        >
          <h3 className="font-bold text-lg">Новая упаковка</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Название</label>
            <input name="name" required className="w-full border p-2 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Цена (₼)</label>
            <input name="price" type="number" step="0.01" required className="w-full border p-2 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Изображение</label>
            <ImageUpload 
              value="" 
              onChange={(url) => {
                const input = document.getElementById("pkg-image") as HTMLInputElement;
                if(input) input.value = Array.isArray(url) ? url[0] : url;
              }} 
            />
            <input type="hidden" name="image" id="pkg-image" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isAvailable" defaultChecked id="avail" />
            <label htmlFor="avail">В наличии</label>
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

function CardTemplateList({ initialData }: { initialData: CardTemplate[] }) {
  const [isCreating, setIsCreating] = useState(false);

  const recipients = ["mom", "wife", "friend", "colleague", "daughter", "sister", "girl", "husband"];

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
        <form action={async (formData) => {
            await createCardTemplate(formData);
            setIsCreating(false);
          }} 
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
            <label className="block text-sm font-medium mb-1">Текст поздравления</label>
            <textarea name="text" rows={4} required className="w-full border p-2 rounded-lg" placeholder="Поздравляю..." />
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
