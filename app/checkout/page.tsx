import CheckoutForm from "@/components/CheckoutForm";
import { getAllPackaging, getCardTemplates } from "@/app/actions/addons";
import { prisma } from "@/lib/prisma";
import StoreInitializer from "@/components/StoreInitializer";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [rawPackaging, cardTemplates, productsRaw, categoriesRaw] = await Promise.all([
    getAllPackaging(),
    getCardTemplates(),
    prisma.product.findMany({ include: { category: true } }),
    prisma.category.findMany({ include: { attributes: { include: { options: true } } } }),
  ]);

  // Convert Decimals to numbers for Client Component serialization
  const packaging = rawPackaging.map(p => ({
    ...p,
    price: Number(p.price)
  }));

  const products = productsRaw.map(p => {
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

  const categories = categoriesRaw.map(c => ({
    ...c,
    stories: [],
  }));

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-6xl mx-auto text-[var(--foreground)]">
      <StoreInitializer products={products as any} categories={categories as any} sliderItems={[]} />
      <h1 className="text-3xl font-bold mb-8 font-serif text-center">Оформление заказа</h1>
      <CheckoutForm packaging={packaging} cardTemplates={cardTemplates} />
    </div>
  );
}
