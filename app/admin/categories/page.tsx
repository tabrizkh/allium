import CategoryList from "@/components/admin/CategoryList";
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <CategoryList categories={categories} />;
}
