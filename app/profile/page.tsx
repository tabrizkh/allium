import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserOrders } from "@/app/actions/orders";
import { getUserAddresses, getFavoritesAction } from "@/app/actions/user";
import ProfilePageContent from "@/components/profile/ProfilePageContent";
import { prisma } from "@/lib/prisma";
import StoreInitializer from "@/components/StoreInitializer";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const { user } = session;
  const [ordersData, addresses, favoritesRaw, rawPackaging, productsRaw, categoriesRaw] = await Promise.all([
    getUserOrders(),
    getUserAddresses(),
    getFavoritesAction(),
    prisma.packaging.findMany(),
    prisma.product.findMany({ include: { category: true } }),
    prisma.category.findMany({ include: { attributes: { include: { options: true } } } }),
  ]);

  // Convert Decimals to numbers for client components
  const packaging = rawPackaging.map((p: any) => ({
    ...p,
    price: Number(p.price)
  }));

  const products = productsRaw.map((p: any) => {
    let images = [];
    try {
      images = p.images ? JSON.parse(p.images) : [];
    } catch (e) {
      images = [];
    }
    const finalImages = Array.isArray(images) ? images.filter(img => !!img) : [];
    if (finalImages.length === 0) finalImages.push("/placeholder.jpg");
    return {
      ...p,
      price: Number(p.price),
      oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
      images: finalImages,
    };
  });

  const categories = categoriesRaw.map((c: any) => ({
    ...c,
    stories: [],
  }));

  const orders = ordersData.map((order: any) => ({
    ...order,
    total: Number(order.total),
    items: order.items.map((item: any) => ({
      ...item,
      price: Number(item.price)
    }))
  }));

  const favorites = (favoritesRaw || []).map((f: any) => {
     const p = f.product;
     const images = p.images ? JSON.parse(p.images) : [];
     return {
       ...f,
       product: {
         ...p,
         price: Number(p.price),
         oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
         images: Array.isArray(images) ? images : [],
       }
     };
  });

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 max-w-6xl mx-auto text-[var(--foreground)]">
      <StoreInitializer products={products as any} categories={categories as any} sliderItems={[]} />
      <ProfilePageContent 
        user={user} 
        orders={orders} 
        addresses={addresses} 
        favorites={favorites} 
        packaging={packaging}
      />
    </main>
  );
}
