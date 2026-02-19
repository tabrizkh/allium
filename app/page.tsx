import { prisma } from "@/lib/prisma";
import StoreInitializer from "@/components/StoreInitializer";
import ShopPage from "@/components/ShopPage";
import { Product, Category } from "@/lib/types";

function mapPrismaProduct(p: any): Product {
  const images = p.images ? JSON.parse(p.images) : [];
  const recipients = p.recipients ? JSON.parse(p.recipients) : [];
  const occasions = p.occasions ? JSON.parse(p.occasions) : [];
  
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
    images: Array.isArray(images) ? images : [],
    categoryId: p.categoryId,
    category: {
      id: p.category.id,
      name: p.category.name,
      slug: p.category.slug,
      image: p.category.image,
    },
    isPopular: p.isPopular,
    inStock: p.inStock,
    recipients: Array.isArray(recipients) ? recipients : [],
    occasions: Array.isArray(occasions) ? occasions : [],
  };
}

export default async function Home() {
  const [prismaProducts, prismaCategories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  const products = prismaProducts.map(mapPrismaProduct);
  const categories: Category[] = prismaCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image,
  }));

  return (
    <main>
      <StoreInitializer products={products} categories={categories} />
      <ShopPage />
    </main>
  );
}
