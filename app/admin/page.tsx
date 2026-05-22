import { prisma } from "@/lib/prisma";
import { Users, ShoppingBag, FolderTree, Image as ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

async function getStats() {
  const [userCount, productCount, categoryCount, storyCount] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.category.count(),
    prisma.story.count(),
  ]);

  return { userCount, productCount, categoryCount, storyCount };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-[var(--foreground)]">Панель управления</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Пользователи" 
          value={stats.userCount} 
          icon={Users} 
          color="bg-blue-500"
        />
        <StatCard 
          title="Товары" 
          value={stats.productCount} 
          icon={ShoppingBag} 
          color="bg-green-500"
        />
        <StatCard 
          title="Категории" 
          value={stats.categoryCount} 
          icon={FolderTree} 
          color="bg-purple-500"
        />
        <StatCard 
          title="Сторис" 
          value={stats.storyCount} 
          icon={ImageIcon} 
          color="bg-pink-500"
        />
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)]">Добро пожаловать в админ-панель Allium</h2>
        <p className="text-gray-600">
          Здесь вы можете управлять товарами, категориями и контентом вашего магазина.
          Используйте меню слева для навигации.
        </p>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
      <div className={`p-4 rounded-full text-white ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
