"use client";

import { useState } from "react";
import { createCategory, updateCategory, deleteCategory } from "@/app/actions/categories";
import { createAttribute, deleteAttribute, createAttributeOption, deleteAttributeOption } from "@/app/actions/attributes";
import { createPackaging, deletePackaging } from "@/app/actions/addons";
import { Edit, Trash2, Plus, X, Settings2, Package } from "lucide-react";
import Image from "next/image";
import ImageUpload from "@/components/admin/ImageUpload";

type AttributeOption = {
  id: string;
  name: string;
};

type Attribute = {
  id: string;
  name: string;
  options: AttributeOption[];
};

type Packaging = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  isAvailable: boolean;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  attributes: Attribute[];
  packaging: Packaging[];
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

export default function CategoryList({ categories }: { categories: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAttributesModalOpen, setIsAttributesModalOpen] = useState(false);
  const [isPackagingModalOpen, setIsPackagingModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const editingCategory = categories.find(c => c.id === editingCategoryId) || null;

  const openCreateModal = () => {
    setEditingCategoryId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategoryId(category.id);
    setIsModalOpen(true);
  };

  const openAttributesModal = (category: Category) => {
    setEditingCategoryId(category.id);
    setIsAttributesModalOpen(true);
  };

  const openPackagingModal = (category: Category) => {
    setEditingCategoryId(category.id);
    setIsPackagingModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить эту категорию?")) {
      await deleteCategory(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Категории</h1>
        <button
          onClick={openCreateModal}
          className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition"
        >
          <Plus size={20} />
          Добавить категорию
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">Изображение</th>
              <th className="p-4 font-medium text-gray-500">Название</th>
              <th className="p-4 font-medium text-gray-500">Slug (URL)</th>
              <th className="p-4 font-medium text-gray-500 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="p-4">
                  {category.image ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border">
                      <Image src={category.image} alt={category.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                      Нет
                    </div>
                  )}
                </td>
                <td className="p-4 font-medium">{category.name}</td>
                <td className="p-4 text-gray-500">{category.slug}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openPackagingModal(category)}
                      title="Упаковка"
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                    >
                      <Package size={18} />
                    </button>
                    <button
                      onClick={() => openAttributesModal(category)}
                      title="Характеристики"
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                    >
                      <Settings2 size={18} />
                    </button>
                    <button
                      onClick={() => openEditModal(category)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isAttributesModalOpen && editingCategory && (
        <AttributesModal
          category={editingCategory}
          onClose={() => setIsAttributesModalOpen(false)}
        />
      )}

      {isPackagingModalOpen && editingCategory && (
        <PackagingModal
          category={editingCategory}
          onClose={() => setIsPackagingModalOpen(false)}
        />
      )}
    </div>
  );
}

function PackagingModal({ category, onClose }: { category: any; onClose: () => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [activeLang, setActiveLang] = useState("ru");
  const [newImage, setNewImage] = useState("");
  const [names, setNames] = useState({
    ru: "",
    en: "",
    az: "",
  });

  const handleAdd = async (formData: FormData) => {
    formData.append("categoryId", category.id);
    formData.append("isAvailable", "on");
    formData.set("name", names.ru);
    formData.set("name_en", names.en);
    formData.set("name_az", names.az);
    
    await createPackaging(formData);
    setIsAdding(false);
    setNewImage("");
    setNames({ ru: "", en: "", az: "" });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Удалить этот вариант упаковки?")) {
      await deletePackaging(id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold mb-2">Упаковка: {category.name}</h2>
        <p className="text-sm text-gray-500 mb-6">Добавьте варианты упаковки, которые будут доступны для товаров этой категории.</p>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Доступные варианты</h3>
            {!isAdding && (
              <button 
                onClick={() => setIsAdding(true)}
                className="bg-[var(--accent)] text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
              >
                <Plus size={16} /> Добавить
              </button>
            )}
          </div>

          {isAdding && (
            <div className="border rounded-xl p-4 bg-gray-50 animate-in fade-in slide-in-from-top-2">
              <form action={handleAdd} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Название ({activeLang.toUpperCase()})</label>
                    <LanguageTabs activeLang={activeLang} onChange={setActiveLang} />
                    <input 
                      value={names[activeLang as keyof typeof names]}
                      onChange={(e) => setNames({ ...names, [activeLang]: e.target.value })}
                      required={activeLang === 'ru'} 
                      className="w-full border rounded-lg p-2 text-sm" 
                      placeholder="Напр. Крафт-бумага" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Цена (₼)</label>
                    <div className="mb-[34px]" /> {/* Spacer for tabs */}
                    <input name="price" type="number" step="0.01" required className="w-full border rounded-lg p-2 text-sm" placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Изображение</label>
                  <ImageUpload value={newImage} onChange={(url) => setNewImage(url as string)} />
                  <input type="hidden" name="image" value={newImage} />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-gray-500 hover:underline">Отмена</button>
                  <button type="submit" className="px-6 py-2 bg-[var(--accent)] text-white rounded-lg text-sm font-bold">Сохранить</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.packaging?.map((pkg) => (
              <div key={pkg.id} className="border rounded-xl p-3 bg-white flex gap-3 group relative">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border bg-gray-50 flex-shrink-0">
                  {pkg.image ? (
                    <Image src={pkg.image} alt={pkg.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={20} /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-800 truncate">{pkg.name}</div>
                  <div className="text-sm text-[var(--accent)] font-medium">{pkg.price} ₼</div>
                  <div className={`text-[10px] mt-1 ${pkg.isAvailable ? "text-green-600" : "text-red-500"}`}>
                    {pkg.isAvailable ? "В наличии" : "Нет в наличии"}
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(pkg.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition absolute top-2 right-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {(!category.packaging || category.packaging.length === 0) && (
              <div className="md:col-span-2 text-center py-12 text-gray-400 border-2 border-dashed rounded-xl">
                Упаковка для этой категории пока не добавлена
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AttributesModal({ category, onClose }: { category: Category; onClose: () => void }) {
  const [newAttrName, setNewAttrName] = useState("");
  const [newOptionNames, setNewOptionNames] = useState<Record<string, string>>({});

  const handleAddAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttrName.trim()) return;
    await createAttribute(category.id, newAttrName);
    setNewAttrName("");
  };

  const handleAddOption = async (attributeId: string) => {
    const name = newOptionNames[attributeId];
    if (!name?.trim()) return;
    await createAttributeOption(attributeId, name);
    setNewOptionNames({ ...newOptionNames, [attributeId]: "" });
  };

  const handleDeleteAttribute = async (id: string) => {
    if (confirm("Удалить характеристику и все её опции?")) {
      await deleteAttribute(id);
    }
  };

  const handleDeleteOption = async (id: string) => {
    await deleteAttributeOption(id);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold mb-2">Характеристики: {category.name}</h2>
        <p className="text-sm text-gray-500 mb-6">Добавьте параметры (например, "Размер") и варианты для них (S, M, L).</p>

        <div className="space-y-6">
          {/* New Attribute Form */}
          <form onSubmit={handleAddAttribute} className="flex gap-2">
            <input
              value={newAttrName}
              onChange={(e) => setNewAttrName(e.target.value)}
              placeholder="Название характеристики (например, Размер)"
              className="flex-1 border rounded-lg p-2 text-sm"
            />
            <button type="submit" className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1">
              <Plus size={16} /> Добавить
            </button>
          </form>

          {/* List of Attributes */}
          <div className="space-y-4">
            {category.attributes?.map((attr) => (
              <div key={attr.id} className="border rounded-xl p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-700">{attr.name}</h3>
                  <button onClick={() => handleDeleteAttribute(attr.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {attr.options?.map((opt) => (
                    <span key={opt.id} className="inline-flex items-center gap-1 px-3 py-1 bg-white border rounded-full text-xs font-medium">
                      {opt.name}
                      <button onClick={() => handleDeleteOption(opt.id)} className="text-gray-400 hover:text-red-500 ml-1">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    value={newOptionNames[attr.id] || ""}
                    onChange={(e) => setNewOptionNames({ ...newOptionNames, [attr.id]: e.target.value })}
                    placeholder="Новый вариант..."
                    className="flex-1 border rounded-lg px-3 py-1.5 text-xs bg-white"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddOption(attr.id)}
                  />
                  <button onClick={() => handleAddOption(attr.id)} className="bg-white border text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-100 transition">
                    OK
                  </button>
                </div>
              </div>
            ))}
            {(!category.attributes || category.attributes.length === 0) && (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-xl">
                Характеристик пока нет
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



function CategoryModal({ category, onClose }: { category: any | null; onClose: () => void }) {
  const isEditing = !!category;
  const [activeLang, setActiveLang] = useState("ru");
  const [imageUrl, setImageUrl] = useState(category?.image || "");
  const [names, setNames] = useState({
    ru: category?.name || "",
    en: category?.name_en || "",
    az: category?.name_az || "",
  });

  async function handleSubmit(formData: FormData) {
    formData.set("name", names.ru);
    formData.set("name_en", names.en);
    formData.set("name_az", names.az);
    
    if (isEditing && category) {
      await updateCategory(category.id, formData);
    } else {
      await createCategory(formData);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold mb-6">
          {isEditing ? "Редактировать категорию" : "Новая категория"}
        </h2>
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название ({activeLang.toUpperCase()})</label>
            <LanguageTabs activeLang={activeLang} onChange={setActiveLang} />
            <input
              value={names[activeLang as keyof typeof names]}
              onChange={(e) => setNames({ ...names, [activeLang]: e.target.value })}
              required={activeLang === 'ru'}
              className="w-full border rounded-lg p-2"
              placeholder="Например, Букеты"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
            <input
              name="slug"
              defaultValue={category?.slug}
              required
              className="w-full border rounded-lg p-2"
              placeholder="bukety"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Изображение</label>
            <ImageUpload
              value={imageUrl}
              onChange={(val) => setImageUrl(val as string)}
            />
            <input type="hidden" name="image" value={imageUrl} />
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
              className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
