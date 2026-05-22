import CategoryList from "@/components/admin/CategoryList";
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      attributes: {
        include: {
          options: true
        }
      },
      packaging: true
    }
  });

  // Convert Decimal to Number for Client Components serialization
  const serializedCategories = categories.map(cat => ({
    ...cat,
    packaging: cat.packaging.map(pkg => ({
      ...pkg,
      price: Number(pkg.price)
    }))
  }));

  return <CategoryList categories={serializedCategories as any} />;
}
