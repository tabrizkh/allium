"use client";

import { useState } from "react";
import { createProduct, updateProduct, deleteProduct, toggleTrending } from "@/app/actions/products";
import { Edit, Trash2, Plus, X, Star, TrendingUp } from "lucide-react";
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
  name_en?: string | null;
  name_az?: string | null;
  slug: string;
  price: number; // Actually Decimal, but handled as number in JS
  oldPrice: number | null;
  categoryId: string;
  category: Category;
  images: string;
  description: string | null;
  description_en?: string | null;
  description_az?: string | null;
  isPopular: boolean;
  isTrending: boolean;
  inStock: boolean;
  productOptions?: string; // JSON string
  recipients?: string; // JSON string
  occasions?: string; // JSON string
};

type AttributeOption = {
  id: string;
  name: string;
  name_en?: string | null;
  name_az?: string | null;
};

type Attribute = {
  id: string;
  name: string;
  name_en?: string | null;
  name_az?: string | null;
  options: AttributeOption[];
};

type ExtendedCategory = Category & {
  attributes: Attribute[];
};

export default function ProductList({ products, categories }: { products: Product[], categories: ExtendedCategory[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const openCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct({
        ...product,
        price: Number(product.price),
        oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
        categoryId: product.categoryId,
        productOptions: product.productOptions,
        isTrending: product.isTrending,
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
              <th className="p-4 font-medium text-gray-500">Тренды</th>
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
                        <td className="p-4 text-gray-900 font-medium">{Number(product.price).toLocaleString()} ₼</td>
                        <td className="p-4">
                            <button
                                onClick={() => toggleTrending(product.id, !product.isTrending)}
                                className={`p-2 rounded-lg transition-all ${
                                    product.isTrending 
                                    ? "bg-amber-100 text-amber-600 hover:bg-amber-200" 
                                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                }`}
                                title={product.isTrending ? "Убрать из трендов" : "Добавить в тренды"}
                            >
                                <TrendingUp size={18} />
                            </button>
                        </td>
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

function ProductModal({ product, categories, onClose }: { product: Product | null; categories: ExtendedCategory[]; onClose: () => void }) {
  const isEditing = !!product;
  const [activeLang, setActiveLang] = useState("ru");
  
  // Multilang states
  const [names, setNames] = useState({
    ru: product?.name || "",
    en: product?.name_en || "",
    az: product?.name_az || "",
  });
  const [descriptions, setDescriptions] = useState({
    ru: product?.description || "",
    en: product?.description_en || "",
    az: product?.description_az || "",
  });

  const [images, setImages] = useState<string[]>(product?.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : []);
  const [recipients, setRecipients] = useState<Recipient[]>(
    product?.recipients ? (typeof product.recipients === 'string' ? JSON.parse(product.recipients) : product.recipients) : []
  );
  const [occasions, setOccasions] = useState<Occasion[]>(
    product?.occasions ? (typeof product.occasions === 'string' ? JSON.parse(product.occasions) : product.occasions) : []
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState(product?.categoryId || "");
  const [productOptions, setProductOptions] = useState<Record<string, Record<string, number>>>(
    product?.productOptions ? (typeof product.productOptions === 'string' ? JSON.parse(product.productOptions) : product.productOptions) : {}
  );
  const [isTrending, setIsTrending] = useState(product?.isTrending || false);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  async function handleSubmit(formData: FormData) {
    formData.set("name", names.ru);
    formData.set("name_en", names.en);
    formData.set("name_az", names.az);
    formData.set("description", descriptions.ru);
    formData.set("description_en", descriptions.en);
    formData.set("description_az", descriptions.az);
    
    formData.set("images", JSON.stringify(images));
    formData.set("recipients", JSON.stringify(recipients));
    formData.set("occasions", JSON.stringify(occasions));
    formData.set("productOptions", JSON.stringify(productOptions));
    formData.set("isTrending", isTrending ? "on" : "off");

    if (isEditing && product) {
      await updateProduct(product.id, formData);
    } else {
      await createProduct(formData);
    }
    onClose();
  }

  const toggleOption = (attributeId: string, optionId: string) => {
    setProductOptions(prev => {
      const next = { ...prev };
      if (!next[attributeId]) {
        next[attributeId] = { [optionId]: 0 };
      } else if (next[attributeId][optionId] !== undefined) {
        // Option exists, remove it
        const { [optionId]: _, ...remainingOptions } = next[attributeId];
        if (Object.keys(remainingOptions).length === 0) {
          delete next[attributeId];
        } else {
          next[attributeId] = remainingOptions;
        }
      } else {
        // Add new option to existing attribute
        next[attributeId] = {
          ...next[attributeId],
          [optionId]: 0
        };
      }
      return next;
    });
  };

  const updateOptionPrice = (attributeId: string, optionId: string, price: number) => {
    setProductOptions(prev => ({
      ...prev,
      [attributeId]: {
        ...prev[attributeId],
        [optionId]: price
      }
    }));
  };

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
                <label className="block text-sm font-medium text-gray-700 mb-1">Название ({activeLang.toUpperCase()})</label>
                <LanguageTabs activeLang={activeLang} onChange={setActiveLang} />
                <input
                  value={names[activeLang as keyof typeof names]}
                  onChange={(e) => setNames({ ...names, [activeLang]: e.target.value })}
                  required={activeLang === 'ru'}
                  className="w-full border rounded-lg p-2"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                <div className="mb-2 h-[26px]" /> {/* Spacer to align with names */}
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
            <select 
              name="categoryId" 
              value={selectedCategoryId} 
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              required 
              className="w-full border rounded-lg p-2"
            >
                <option value="">Выберите категорию</option>
                {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
          </div>

          {/* Dynamic Attributes Section */}
          {selectedCategory && selectedCategory.attributes.length > 0 && (
            <div className="bg-purple-50 p-4 rounded-xl space-y-4">
              <h3 className="font-bold text-purple-900 text-sm">Характеристики категории: {selectedCategory.name}</h3>
              <div className="grid gap-4">
                {selectedCategory.attributes.map(attr => (
                  <div key={attr.id} className="space-y-2">
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">{attr.name}</span>
                    <div className="grid gap-2">
                      {attr.options.map(opt => {
                        const isSelected = productOptions[attr.id]?.[opt.id] !== undefined;
                        const priceAdj = productOptions[attr.id]?.[opt.id] || 0;
                        return (
                          <div key={opt.id} className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => toggleOption(attr.id, opt.id)}
                              className={`flex-1 flex justify-between items-center px-3 py-2 rounded-lg border text-sm transition ${
                                isSelected 
                                  ? "bg-white border-purple-500 text-purple-700 shadow-sm" 
                                  : "bg-white/50 border-gray-200 text-gray-400"
                              }`}
                            >
                              <span>{opt.name}</span>
                              {isSelected && <span className="text-[10px] font-bold">АКТИВНО</span>}
                            </button>
                            {isSelected && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-purple-600 font-medium">+</span>
                                <input
                                  type="number"
                                  value={priceAdj === 0 ? "" : priceAdj}
                                  onChange={(e) => updateOptionPrice(attr.id, opt.id, Number(e.target.value))}
                                  placeholder="Цена"
                                  className="w-24 border border-purple-200 rounded-lg p-1.5 text-sm focus:ring-1 focus:ring-purple-400 outline-none"
                                />
                                <span className="text-xs text-purple-600">₼</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание ({activeLang.toUpperCase()})</label>
            <textarea
              value={descriptions[activeLang as keyof typeof descriptions]}
              onChange={(e) => setDescriptions({ ...descriptions, [activeLang]: e.target.value })}
              className="w-full border rounded-lg p-2 h-24"
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
                <input type="checkbox" name="isPopular" defaultChecked={product?.isPopular} />
                <span className="text-sm">Популярный товар</span>
            </label>
            <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  name="isTrending" 
                  checked={isTrending} 
                  onChange={(e) => setIsTrending(e.target.checked)} 
                />
                <span className="text-sm">В трендах</span>
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
