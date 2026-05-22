import { prisma } from "@/lib/prisma";
import StoreInitializer from "@/components/StoreInitializer";
import ShopPage from "@/components/ShopPage";
import { Product, Category } from "@/lib/types";

function mapPrismaProduct(p: any): Product {
  let images = [];
  try {
    images = p.images ? JSON.parse(p.images) : [];
  } catch (e) {
    images = [];
  }
  const recipients = p.recipients ? JSON.parse(p.recipients) : [];
  const occasions = p.occasions ? JSON.parse(p.occasions) : [];
  
  const finalImages = Array.isArray(images) ? images.filter(img => !!img) : [];
  if (finalImages.length === 0) finalImages.push("/placeholder.jpg");
  
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
    images: finalImages,
    categoryId: p.categoryId,
    category: {
      id: p.category.id,
      name: p.category.name,
      slug: p.category.slug,
      image: p.category.image,
      stories: [],
    },
    isPopular: p.isPopular,
    isTrending: p.isTrending,
    inStock: p.inStock,
    recipients: Array.isArray(recipients) ? recipients : [],
    occasions: Array.isArray(occasions) ? occasions : [],
    productOptions: p.productOptions || "{}",
    orderItems: [],
    favorites: [],
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  } as Product;
}

export default async function Home() {
  const [products, categories, sliderItems] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        reviews: {
          include: {
            user: true
          },
          orderBy: { createdAt: "desc" }
        }
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        attributes: {
          include: {
            options: true,
          }
        },
        stories: {
          where: { isActive: true },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.sliderItem.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
  ]);

  // Convert Decimals to numbers for client components
  const serializedProducts = products.map((p) => {
    let images = [];
    try {
      images = p.images ? JSON.parse(p.images) : [];
    } catch (e) {
      images = [];
    }
    const recipients = p.recipients ? JSON.parse(p.recipients) : [];
    const occasions = p.occasions ? JSON.parse(p.occasions) : [];

    const finalImages = Array.isArray(images) ? images.filter(img => !!img) : [];
    if (finalImages.length === 0) finalImages.push("/placeholder.jpg");

    return {
      ...p,
      price: Number(p.price),
      oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
      images: finalImages,
      isTrending: p.isTrending,
      recipients: Array.isArray(recipients) ? recipients : [],
      occasions: Array.isArray(occasions) ? occasions : [],
      orderItems: [],
      favorites: [],
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      category: {
        ...p.category,
        stories: [],
      },
    } as Product;
  });

  // Map categories to match the expected type
  const serializedCategories = categories.map((c) => ({
    ...c,
    stories: c.stories.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      mediaUrl: s.mediaUrl,
      type: s.type as "image" | "video",
      isActive: s.isActive,
    })),
  })) as Category[];

  return (
    <main className="min-h-screen pb-20 md:pb-0">
      <StoreInitializer 
        products={serializedProducts} 
        categories={serializedCategories} 
        sliderItems={sliderItems}
      />
      <ShopPage />
    </main>
  );
}
