import CheckoutForm from "@/components/CheckoutForm";
import { getAllPackaging, getCardTemplates } from "@/app/actions/addons";

export default async function CheckoutPage() {
  const packaging = await getAllPackaging();
  const cardTemplates = await getCardTemplates();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-6xl mx-auto text-[var(--foreground)]">
      <h1 className="text-3xl font-bold mb-8 font-serif text-center">Оформление заказа</h1>
      <CheckoutForm packaging={packaging} cardTemplates={cardTemplates} />
    </div>
  );
}
