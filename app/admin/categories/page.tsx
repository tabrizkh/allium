import CategoryList from "@/components/admin/CategoryList";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
  const serializedCategories = categories.map((cat: any) => ({
    ...cat,
    packaging: cat.packaging.map((pkg: any) => ({
      ...pkg,
      price: Number(pkg.price)
    }))
  }));

  return <CategoryList categories={serializedCategories as any} />;
}
