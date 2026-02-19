"use client";

import { useShopStore } from "@/store/useShopStore";
import { useState, useEffect } from "react";
import { createOrder } from "@/app/actions/orders";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { Check, Gift, MessageSquare, User as UserIcon } from "lucide-react";

type Packaging = {
  id: string;
  name: string;
  price: number;
  image: string;
  isAvailable: boolean;
};

type CardTemplate = {
  id: string;
  text: string;
  recipient: string;
};

export default function CheckoutForm({ packaging = [], cardTemplates = [] }: { packaging?: Packaging[], cardTemplates?: CardTemplate[] }) {
  const { cart, products, clearCart, user } = useShopStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Addons state
  const [selectedPackagingId, setSelectedPackagingId] = useState<string | null>(null);
  const [addCard, setAddCard] = useState(false);
  const [cardText, setCardText] = useState("");
  const [cardRecipient, setCardRecipient] = useState("");

  const RECIPIENTS = ["Маме", "Жене", "Девушке", "Дочери", "Коллеге", "Мужу", "Бабушке", "Сестре", "Другое"];

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "Baku",
    comment: "",
  });

  // Sync user data when available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  if (!mounted) return null;

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => {
      const product = products.find((p) => p.id === id);
      return product ? { ...product, qty } : null;
    })
    .filter((item) => item !== null);

  const subtotal = cartItems.reduce((acc, item) => {
    return acc + (item!.price || 0) * item!.qty;
  }, 0);

  const packagingPrice = selectedPackagingId 
    ? (packaging.find(p => p.id === selectedPackagingId)?.price || 0) 
    : 0;

  const total = subtotal + packagingPrice;

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-serif mb-4">Ваша корзина пуста</h2>
        <Link href="/" className="text-[var(--accent)] hover:underline">
          Вернуться в магазин
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createOrder({
        items: cartItems.map((item) => ({ productId: item!.id, quantity: item!.qty })),
        total,
        details: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          comment: formData.comment,
        },
        addons: {
          packagingId: selectedPackagingId || undefined,
          cardText: addCard ? cardText : undefined,
          cardRecipient: addCard ? cardRecipient : undefined,
        }
      });

      if (result.success) {
        clearCart();
        toast.success("Заказ успешно оформлен!");
        router.push("/profile");
      } else {
        toast.error("Ошибка при оформлении заказа");
      }
    } catch (error) {
      console.error(error);
      toast.error("Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = cardRecipient 
    ? cardTemplates.filter(t => t.recipient.toLowerCase() === cardRecipient.toLowerCase())
    : cardTemplates;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Order Summary & Addons */}
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-serif mb-6 flex items-center gap-2">
            <Gift className="w-6 h-6 text-[var(--accent)]" />
            Ваш заказ
          </h2>
          <div className="bg-white/50 rounded-2xl p-6 border border-[var(--accent)]/20 space-y-4">
            {cartItems.map((item) => (
              <div key={item!.id} className="flex justify-between items-center border-b border-[var(--accent)]/10 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden relative">
                    {item!.images?.[0] ? (
                      <Image
                        src={item!.images[0]}
                        alt={item!.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{item!.name}</h3>
                    <p className="text-sm text-[var(--accent)]">
                      {item!.qty} шт. × {item!.price} ₼
                    </p>
                  </div>
                </div>
                <div className="font-medium">
                  {((item!.price || 0) * item!.qty).toFixed(2)} ₼
                </div>
              </div>
            ))}
            
            {selectedPackagingId && (
              <div className="flex justify-between items-center pt-4 border-t border-[var(--accent)]/10 text-[var(--accent)]">
                <div className="flex items-center gap-2">
                   <Gift size={16} />
                   <span>Упаковка: {packaging.find(p => p.id === selectedPackagingId)?.name}</span>
                </div>
                <div>{packagingPrice.toFixed(2)} ₼</div>
              </div>
            )}

            <div className="flex justify-between items-center text-xl font-bold border-t border-[var(--accent)]/20 pt-4 mt-4">
              <span>Итого:</span>
              <span>{total.toFixed(2)} ₼</span>
            </div>
          </div>
        </section>

        {/* Packaging Selection */}
        {packaging.length > 0 && (
          <section>
            <h3 className="text-xl font-serif mb-4">Выберите упаковку</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div 
                onClick={() => setSelectedPackagingId(null)}
                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                  selectedPackagingId === null 
                    ? "border-[var(--accent)] bg-[var(--accent)]/5" 
                    : "border-transparent bg-white hover:border-[var(--accent)]/30"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <Gift size={24} />
                </div>
                <span className="text-sm font-medium text-center">Без упаковки</span>
              </div>
              
              {packaging.filter(p => p.isAvailable).map(pkg => (
                <div 
                  key={pkg.id}
                  onClick={() => setSelectedPackagingId(pkg.id)}
                  className={`cursor-pointer rounded-xl border-2 p-3 flex flex-col gap-2 transition-all relative overflow-hidden ${
                    selectedPackagingId === pkg.id 
                      ? "border-[var(--accent)] bg-[var(--accent)]/5" 
                      : "border-transparent bg-white hover:border-[var(--accent)]/30"
                  }`}
                >
                  <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                     {pkg.image ? (
                        <Image src={pkg.image} alt={pkg.name} fill className="object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--accent)]/50">
                          <Gift size={32} />
                        </div>
                     )}
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm leading-tight mb-1">{pkg.name}</div>
                    <div className="text-[var(--accent)] text-sm font-bold">{pkg.price} ₼</div>
                  </div>
                  {selectedPackagingId === pkg.id && (
                    <div className="absolute top-2 right-2 bg-[var(--accent)] text-white p-1 rounded-full shadow-md">
                      <Check size={12} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Card Selection */}
        <section className="bg-white rounded-2xl p-6 border border-[var(--accent)]/20">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-xl font-serif flex items-center gap-2">
               <MessageSquare className="w-5 h-5 text-[var(--accent)]" />
               Добавить открытку?
             </h3>
             <label className="relative inline-flex items-center cursor-pointer">
               <input type="checkbox" checked={addCard} onChange={(e) => setAddCard(e.target.checked)} className="sr-only peer" />
               <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--accent)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
             </label>
          </div>

          {addCard && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-600">Кому открытка?</label>
                <div className="flex flex-wrap gap-2">
                  {RECIPIENTS.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setCardRecipient(r)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        cardRecipient === r 
                          ? "bg-[var(--accent)] text-white" 
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-600">Текст открытки</label>
                <textarea
                  value={cardText}
                  onChange={(e) => setCardText(e.target.value)}
                  placeholder="Напишите ваше поздравление..."
                  className="w-full rounded-xl border border-[var(--accent)]/30 p-3 h-24 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              {/* Templates */}
              {(filteredTemplates.length > 0 || cardTemplates.length > 0) && (
                <div>
                   <label className="text-xs font-medium mb-2 block text-[var(--accent)] uppercase tracking-wider">Готовые шаблоны</label>
                   <div className="flex flex-wrap gap-2">
                     {(cardRecipient ? filteredTemplates : cardTemplates).slice(0, 6).map(t => (
                       <button
                         key={t.id}
                         type="button"
                         onClick={() => setCardText(t.text)}
                         className="text-xs border border-[var(--accent)]/30 px-3 py-1.5 rounded-lg hover:bg-[var(--accent)]/5 text-left max-w-[200px] truncate transition-colors"
                         title={t.text}
                       >
                         {t.text}
                       </button>
                     ))}
                   </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Checkout Form Details */}
      <div>
        <h2 className="text-2xl font-serif mb-6">Оформление</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Имя</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--background)] p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              placeholder="Ваше имя"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--background)] p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              placeholder="example@mail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Телефон</label>
            <input
              required
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--background)] p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              placeholder="+994..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium mb-1">Город</label>
                <input
                  required
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--background)] p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
             </div>
             <div>
                <label className="block text-sm font-medium mb-1">Адрес</label>
                <input
                  required
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--background)] p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  placeholder="Улица, дом, кв."
                />
             </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Комментарий к заказу</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="w-full rounded-xl border border-[var(--accent-strong)]/60 bg-[var(--background)] p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent)] h-24"
              placeholder="Код домофона, пожелания..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--accent)] text-white py-4 rounded-xl font-medium text-lg hover:opacity-90 transition mt-6 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Оформление..." : "Подтвердить заказ"}
          </button>
        </form>
      </div>
    </div>
  );
}
