"use client";

import { useState } from "react";
import { createCategory, updateCategory, deleteCategory } from "@/app/actions/categories";
import { Edit, Trash2, Plus, X } from "lucide-react";
import Image from "next/image";
import ImageUpload from "@/components/admin/ImageUpload";

type Category = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
};

export default function CategoryList({ categories }: { categories: Category[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const openCreateModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
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
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  Категорий пока нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}


function CategoryModal({ category, onClose }: { category: Category | null; onClose: () => void }) {
  const isEditing = !!category;
  const [imageUrl, setImageUrl] = useState(category?.image || "");

  async function handleSubmit(formData: FormData) {
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
            <input
              name="name"
              defaultValue={category?.name}
              required
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
