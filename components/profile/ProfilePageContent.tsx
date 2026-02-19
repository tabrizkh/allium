"use client";

import { useState } from "react";
import ProfileInfo from "./ProfileInfo";
import OrderHistory from "./OrderHistory";
import AddressBook from "./AddressBook";
import FavoritesList from "./FavoritesList";
import { User, Package, MapPin, Heart, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function ProfilePageContent({ user, orders, addresses, favorites }: any) {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Профиль", icon: User },
    { id: "orders", label: "Заказы", icon: Package },
    { id: "addresses", label: "Адреса", icon: MapPin },
    { id: "favorites", label: "Избранное", icon: Heart },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-72 flex-shrink-0 space-y-6">
        <div className="bg-white border border-[var(--accent)]/20 rounded-2xl p-6 shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-full flex items-center justify-center text-[var(--accent)]">
                 <User size={24} />
             </div>
             <div className="min-w-0">
                 <div className="font-serif font-bold text-lg truncate">{user.name}</div>
                 <div className="text-sm text-gray-500 truncate">{user.email}</div>
             </div>
        </div>

        <nav className="bg-white border border-[var(--accent)]/20 rounded-2xl p-2 shadow-sm space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left font-medium ${
                  isActive
                    ? "bg-[var(--accent)] text-white shadow-md"
                    : "text-gray-600 hover:bg-[var(--accent)]/5 hover:text-[var(--accent)]"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                <span>{tab.label}</span>
              </button>
            );
          })}
          
          <div className="pt-2 mt-2 border-t border-gray-100">
            <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left text-red-500 hover:bg-red-50 font-medium"
            >
                <LogOut size={20} strokeWidth={1.5} />
                <span>Выйти</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-[500px]">
     

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "profile" && <ProfileInfo user={user} />}
          {activeTab === "orders" && <OrderHistory orders={orders} />}
          {activeTab === "addresses" && <AddressBook addresses={addresses} />}
          {activeTab === "favorites" && <FavoritesList favorites={favorites} />}
        </div>
      </div>
    </div>
  );
}
