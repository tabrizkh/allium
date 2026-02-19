"use client";
import Header from "../../components/Header";
import Image from "next/image";
import { useShopStore } from "../../store/useShopStore";

export default function CartPage() {
  const { products, cart, addToCart, removeFromCart } = useShopStore();
  const entries = Object.entries(cart);
  const items = entries.map(([id, qty]) => ({
    product: products.find((p) => p.id === id)!,
    qty,
  }));
  const total = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Корзина</h1>
        {items.length === 0 ? (
          <p className="text-[var(--accent)]">Корзина пуста.</p>
        ) : (
          <div className="space-y-4">
            {items.map(({ product, qty }) => (
              <div
                key={product.id}
                className="flex items-center gap-4 rounded-xl border border-[var(--accent-strong)]/60 p-3 bg-[var(--background)]"
              >
                <div className="relative w-20 h-20 bg-[var(--panel-bg)] rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-[var(--accent)]">{product.price} ₼</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="rounded-lg border border-[var(--accent-strong)]/60 bg-[var(--background)] text-[var(--foreground)] px-2 py-1"
                  >
                    −
                  </button>
                  <span className="w-8 text-center">{qty}</span>
                  <button
                    onClick={() => addToCart(product.id)}
                    className="rounded-lg border border-[var(--accent-strong)]/60 bg-[var(--background)] text-[var(--foreground)] px-2 py-1"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-[var(--accent-strong)]/60 pt-4">
              <div className="text-lg font-semibold">Итого: {total} ₼</div>
              <button className="rounded-xl bg-[var(--buy-button-bg)] text-[var(--foreground)] px-4 py-2">
                Оформить заказ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}