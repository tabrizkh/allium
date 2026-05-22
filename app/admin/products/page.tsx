import ProductList from "@/components/admin/ProductList";
import { prisma } from "@/lib/prisma";

export default async function ProductsPage() {
  const [productsData, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      include: {
        attributes: {
          include: {
            options: true
          }
        }
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const products = productsData.map((product) => ({
    ...product,
    price: Number(product.price),
    oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }));

  return <ProductList products={products} categories={categories as any} />;
}
