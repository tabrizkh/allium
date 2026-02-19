"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions/user";
import { toast } from "sonner";
import { User } from "lucide-react";

export default function ProfileInfo({ user }: { user: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateProfile(formData);
    if (res.success) {
      toast.success("Профиль обновлен");
      setIsEditing(false);
    } else {
      toast.error("Ошибка при обновлении профиля");
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-[var(--accent)] block mb-1">Имя</label>
          <input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--background)] p-3"
          />
        </div>
        <div>
          <label className="text-sm text-[var(--accent)] block mb-1">Телефон</label>
          <input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--background)] p-3"
            placeholder="+994..."
          />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="bg-[var(--accent)] text-white px-6 py-2 rounded-xl">Сохранить</button>
          <button type="button" onClick={() => setIsEditing(false)} className="border border-[var(--accent-strong)]/60 px-6 py-2 rounded-xl">Отмена</button>
        </div>
      </form>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-[var(--accent)]/20 shadow-sm relative">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-serif font-medium">Личные данные</h2>
        <button 
            onClick={() => setIsEditing(true)}
            className="text-sm text-[var(--accent)] hover:bg-[var(--accent)]/10 px-3 py-1.5 rounded-lg transition"
        >
            Редактировать
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-[var(--panel-bg)] rounded-xl border border-[var(--accent)]/10">
            <label className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider block mb-2">Имя</label>
            <div className="text-lg">{user.name}</div>
        </div>
        <div className="p-4 bg-[var(--panel-bg)] rounded-xl border border-[var(--accent)]/10">
            <label className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider block mb-2">Email</label>
            <div className="text-lg">{user.email}</div>
        </div>
        <div className="p-4 bg-[var(--panel-bg)] rounded-xl border border-[var(--accent)]/10">
            <label className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider block mb-2">Телефон</label>
            <div className="text-lg">{user.phone || "Не указан"}</div>
        </div>
        <div className="p-4 bg-[var(--panel-bg)] rounded-xl border border-[var(--accent)]/10">
             <label className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider block mb-2">Роль</label>
             <div className="text-lg">{user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}</div>
        </div>
      </div>
    </div>
  );
}
