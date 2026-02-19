"use client";

import { useState } from "react";
import { saveAddressAction } from "@/app/actions/user";
import { toast } from "sonner";
import { Plus, Trash2, MapPin } from "lucide-react";

export default function AddressBook({ addresses }: { addresses: any[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "Baku",
    comment: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await saveAddressAction(formData);
    if (res.success) {
      toast.success("Адрес добавлен");
      setIsAdding(false);
      setFormData({ name: "", phone: "", address: "", city: "Baku", comment: "" });
    } else {
      toast.error("Ошибка при сохранении адреса");
    }
  };

  return (
    <div className="space-y-6">
      {addresses.length === 0 && !isAdding && (
        <div className="bg-white border border-[var(--accent)]/20 rounded-2xl p-12 text-center text-[var(--accent)] flex flex-col items-center gap-4">
           <MapPin size={48} strokeWidth={1} />
           <p className="text-lg">Нет сохраненных адресов</p>
           <button
              onClick={() => setIsAdding(true)}
              className="mt-2 flex items-center gap-2 bg-[var(--accent)] text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition font-medium"
            >
              <Plus size={18} /> Добавить адрес
            </button>
        </div>
      )}

      {addresses.length > 0 && !isAdding && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
                <div key={addr.id} className="bg-white border border-[var(--accent)]/20 rounded-xl p-5 shadow-sm hover:shadow-md transition relative group">
                    <div className="flex items-start justify-between mb-2">
                        <div className="font-serif font-bold text-lg">{addr.name}</div>
                        <div className="p-2 bg-[var(--accent)]/5 rounded-full text-[var(--accent)]">
                            <MapPin size={18} />
                        </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                        <p>{addr.city}, {addr.address}</p>
                        <p>{addr.phone}</p>
                        {addr.comment && <p className="italic text-xs mt-2">"{addr.comment}"</p>}
                    </div>
                    {/* Future: Edit/Delete buttons */}
                </div>
            ))}
            
            <button
                onClick={() => setIsAdding(true)}
                className="border-2 border-dashed border-[var(--accent)]/30 rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-[var(--accent)] hover:bg-[var(--accent)]/5 transition min-h-[160px]"
            >
                <Plus size={32} />
                <span className="font-medium">Добавить новый адрес</span>
            </button>
        </div>
      )}

      {isAdding && (
        <div className="bg-white border border-[var(--accent)]/20 rounded-2xl p-6 shadow-sm max-w-xl">
            <h3 className="font-serif font-bold text-xl mb-4">Новый адрес</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Название (Дом, Работа)</label>
                    <input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-xl border border-[var(--accent)]/30 bg-[var(--background)] p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                        required
                        placeholder="Например: Мой дом"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Телефон</label>
                    <input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-xl border border-[var(--accent)]/30 bg-[var(--background)] p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                        required
                        placeholder="+994..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Адрес</label>
                    <input
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full rounded-xl border border-[var(--accent)]/30 bg-[var(--background)] p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                        required
                        placeholder="Улица, дом, кв."
                    />
                </div>
                <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 bg-[var(--accent)] text-white py-3 rounded-xl font-medium hover:opacity-90 transition">Сохранить</button>
                    <button type="button" onClick={() => setIsAdding(false)} className="flex-1 border border-[var(--accent)]/30 py-3 rounded-xl font-medium hover:bg-gray-50 transition">Отмена</button>
                </div>
            </form>
        </div>
      )}
    </div>
  );
}
