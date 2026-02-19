import ProductList from "@/components/admin/ProductList";
import { prisma } from "@/lib/prisma";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return <ProductList products={products} categories={categories} />;
}
