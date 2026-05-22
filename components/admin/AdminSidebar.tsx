"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, FolderTree, Image as ImageIcon, LogOut, Settings, LayoutPanelLeft, MessageSquare, ClipboardList } from "lucide-react";

const links = [
  { href: "/admin", label: "Главная", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Заказы", icon: ClipboardList },
  { href: "/admin/products", label: "Товары", icon: ShoppingBag },
  { href: "/admin/categories", label: "Категории", icon: FolderTree },
  { href: "/admin/stories", label: "Сторис", icon: ImageIcon },
  { href: "/admin/slider", label: "Слайдер", icon: LayoutPanelLeft },
  { href: "/admin/reviews", label: "Отзывы", icon: MessageSquare },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

import { signOut } from "next-auth/react";

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r h-screen fixed left-0 top-0 overflow-y-auto p-4 flex flex-col z-50">
      <div className="text-2xl font-bold mb-8 text-[var(--accent)] px-4">Admin Panel</div>
      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive ? "bg-[var(--accent)] text-white" : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Icon size={20} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-50 text-red-600 mt-auto w-full text-left"
      >
        <LogOut size={20} />
        Выйти
      </button>
    </aside>
  );
}
