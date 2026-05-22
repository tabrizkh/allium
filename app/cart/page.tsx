"use client";
import Image from "next/image";
import Link from "next/link";
import { useShopStore } from "../../store/useShopStore";

export default function CartPage() {
  const { cart, removeFromCart, updateCartQuantity, products, categories } = useShopStore();
  const cartItems = Array.isArray(cart) ? cart : [];
  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const getOptionName = (productId: string, attrId: string, optId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return "";
    const category = categories.find(c => c.id === product.categoryId);
    if (!category) return "";
    const attr = category.attributes?.find(a => a.id === attrId);
    if (!attr) return "";
    const opt = attr.options.find(o => o.id === optId);
    return opt?.name || "";
  };

  const renderOptions = (item: any) => {
    if (!item.selectedOptions) return null;
    return Object.entries(item.selectedOptions as Record<string, string | string[]>).map(([attrId, val]) => {
      const attrName = getAttributeName(item.productId, attrId);
      const optIds = Array.isArray(val) ? val : [val];
      if (optIds.length === 0) return null;
      return (
        <span key={attrId} className="text-[10px] bg-[var(--accent-strong)]/10 px-2 py-0.5 rounded-full text-[var(--foreground)]/70">
          {attrName}: {optIds.map(id => getOptionName(item.productId, attrId, id)).join(", ")}
        </span>
      );
    });
  };

  const getAttributeName = (productId: string, attrId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return "";
    const category = categories.find(c => c.id === product.categoryId);
    if (!category) return "";
    const attr = category.attributes?.find(a => a.id === attrId);
    return attr?.name || "";
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Корзина</h1>
        {cartItems.length === 0 ? (
          <p className="text-[var(--accent)]">Корзина пуста.</p>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-xl border border-[var(--accent-strong)]/60 p-3 bg-[var(--background)]"
              >
                <div className="relative w-20 h-20 bg-[var(--panel-bg)] rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{item.name}</div>
                  
                  {/* Selected Options */}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {renderOptions(item)}
                  </div>

                  <div className="text-sm text-[var(--accent)] mt-1">{item.price} ₼</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                    className="rounded-lg border border-[var(--accent-strong)]/60 bg-[var(--background)] text-[var(--foreground)] px-2 py-1"
                  >
                    −
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                    className="rounded-lg border border-[var(--accent-strong)]/60 bg-[var(--background)] text-[var(--foreground)] px-2 py-1"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-2 text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-[var(--accent-strong)]/60 pt-4">
              <div className="text-lg font-semibold">Итого: {total} ₼</div>
              <Link 
                href="/checkout" 
                className="rounded-xl bg-[var(--buy-button-bg)] text-[var(--foreground)] px-6 py-2.5 font-medium hover:opacity-90 transition shadow-sm"
              >
                Оформить заказ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}