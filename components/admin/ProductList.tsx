"use client";

import { useState } from "react";
import { createProduct, updateProduct, deleteProduct } from "@/app/actions/products";
import { Edit, Trash2, Plus, X } from "lucide-react";
import Image from "next/image";
import ImageUpload from "@/components/admin/ImageUpload";
import { recipientLabels, occasionLabels } from "@/lib/constants";
import { Recipient, Occasion } from "@/lib/types";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number; // Actually Decimal, but handled as number in JS
  oldPrice: number | null;
  categoryId: string;
  images: string;
  description: string | null;
  isPopular: boolean;
  inStock: boolean;
  recipients?: string; // JSON string
  occasions?: string; // JSON string
};

export default function ProductList({ products, categories }: { products: any[], categories: Category[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const openCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct({
        ...product,
        price: Number(product.price),
        oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
        categoryId: product.categoryId,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить этот товар?")) {
      await deleteProduct(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Товары</h1>
        <button
          onClick={openCreateModal}
          className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition"
        >
          <Plus size={20} />
          Добавить товар
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">Фото</th>
              <th className="p-4 font-medium text-gray-500">Название</th>
              <th className="p-4 font-medium text-gray-500">Категория</th>
              <th className="p-4 font-medium text-gray-500">Цена</th>
              <th className="p-4 font-medium text-gray-500 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => {
                const images = product.images ? JSON.parse(product.images) : [];
                const mainImage = images[0];
                return (
                    <tr key={product.id} className="hover:bg-gray-50">
                        <td className="p-4">
                        {mainImage ? (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border">
                            <Image src={mainImage} alt={product.name} fill className="object-cover" />
                            </div>
                        ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                            Нет
                            </div>
                        )}
                        </td>
                        <td className="p-4 font-medium">{product.name}</td>
                        <td className="p-4 text-gray-500">{product.category.name}</td>
                        <td className="p-4 text-gray-900 font-medium">{Number(product.price).toLocaleString()} ₽</td>
                        <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                            <button
                            onClick={() => openEditModal(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                            <Edit size={18} />
                            </button>
                            <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                            <Trash2 size={18} />
                            </button>
                        </div>
                        </td>
                    </tr>
                )
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Товаров пока нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}


function ProductModal({ product, categories, onClose }: { product: Product | null; categories: Category[]; onClose: () => void }) {
  const isEditing = !!product;
  const [images, setImages] = useState<string[]>(product?.images ? JSON.parse(product.images) : []);
  const [recipients, setRecipients] = useState<Recipient[]>(
    product?.recipients ? JSON.parse(product.recipients) : []
  );
  const [occasions, setOccasions] = useState<Occasion[]>(
    product?.occasions ? JSON.parse(product.occasions) : []
  );

  async function handleSubmit(formData: FormData) {
    formData.set("images", JSON.stringify(images));
    formData.set("recipients", JSON.stringify(recipients));
    formData.set("occasions", JSON.stringify(occasions));

    if (isEditing && product) {
      await updateProduct(product.id, formData);
    } else {
      await createProduct(formData);
    }
    onClose();
  }

  const toggleRecipient = (r: Recipient) => {
    setRecipients((prev) =>
      prev.includes(r) ? prev.filter((i) => i !== r) : [...prev, r]
    );
  };

  const toggleOccasion = (o: Occasion) => {
    setOccasions((prev) =>
      prev.includes(o) ? prev.filter((i) => i !== o) : [...prev, o]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold mb-6">
          {isEditing ? "Редактировать товар" : "Новый товар"}
        </h2>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                <input
                name="name"
                defaultValue={product?.name}
                required
                className="w-full border rounded-lg p-2"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                <input
                name="slug"
                defaultValue={product?.slug}
                required
                className="w-full border rounded-lg p-2"
                />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Цена</label>
                <input
                name="price"
                type="number"
                step="0.01"
                defaultValue={product?.price}
                required
                className="w-full border rounded-lg p-2"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Старая цена (необязательно)</label>
                <input
                name="oldPrice"
                type="number"
                step="0.01"
                defaultValue={product?.oldPrice ?? ""}
                className="w-full border rounded-lg p-2"
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
            <select name="categoryId" defaultValue={product?.categoryId} required className="w-full border rounded-lg p-2">
                <option value="">Выберите категорию</option>
                {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Изображения</label>
            <ImageUpload
              value={images}
              onChange={(val) => setImages(val as string[])}
              multiple
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Кому</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(recipientLabels).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleRecipient(key as Recipient)}
                  className={`px-3 py-1 rounded-full text-sm border transition ${
                    recipients.includes(key as Recipient)
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-[var(--accent)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Повод</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(occasionLabels).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleOccasion(key as Occasion)}
                  className={`px-3 py-1 rounded-full text-sm border transition ${
                    occasions.includes(key as Occasion)
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-[var(--accent)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              name="description"
              defaultValue={product?.description || ""}
              className="w-full border rounded-lg p-2 h-24"
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
                <input type="checkbox" name="isPopular" defaultChecked={product?.isPopular} />
                <span className="text-sm">Популярный товар</span>
            </label>
            <label className="flex items-center gap-2">
                <input type="checkbox" name="inStock" defaultChecked={product?.inStock ?? true} />
                <span className="text-sm">В наличии</span>
            </label>
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
