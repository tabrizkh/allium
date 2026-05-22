"use client";

import { useState } from "react";
import ProfileInfo from "./ProfileInfo";
import OrderHistory from "./OrderHistory";
import AddressBook from "./AddressBook";
import FavoritesList from "./FavoritesList";
import { User, Package, MapPin, Heart, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslation } from "react-i18next";

export default function ProfilePageContent({ user, orders, addresses, favorites, packaging }: any) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: t('header.profile'), icon: User },
    { id: "orders", label: t('profile.orders'), icon: Package },
    { id: "addresses", label: t('profile.addresses'), icon: MapPin },
    { id: "favorites", label: t('profile.favorites'), icon: Heart },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-72 flex-shrink-0 space-y-6">
        <div className="bg-[var(--accent-strong)]/5 border border-[var(--accent-strong)]/20 rounded-2xl p-6 shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 bg-[var(--accent-strong)]/10 rounded-full flex items-center justify-center text-[var(--accent-strong)]">
                 <User size={24} />
             </div>
             <div className="min-w-0">
                 <div className="font-serif font-bold text-lg truncate">{user.name}</div>
                 <div className="text-sm text-gray-500 truncate">{user.email}</div>
             </div>
        </div>

        <nav className="bg-[var(--accent-strong)]/5 border border-[var(--accent-strong)]/20 rounded-2xl p-2 shadow-sm space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left font-medium ${
                  isActive
                    ? "bg-[var(--accent-strong)] text-white shadow-md"
                    : "text-[var(--foreground)]/60 hover:bg-[var(--accent-strong)]/10 hover:text-[var(--accent-strong)]"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                <span>{tab.label}</span>
              </button>
            );
          })}
          
          <div className="pt-2 mt-2 border-t border-[var(--accent-strong)]/10">
            <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left text-red-500 hover:bg-red-50 font-medium"
            >
                <LogOut size={20} strokeWidth={1.5} />
                <span>{t('header.logout')}</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-[500px]">
     

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "profile" && <ProfileInfo user={user} />}
          {activeTab === "orders" && <OrderHistory orders={orders} packaging={packaging} />}
          {activeTab === "addresses" && <AddressBook addresses={addresses} />}
          {activeTab === "favorites" && <FavoritesList favorites={favorites} />}
        </div>
      </div>
    </div>
  );
}
