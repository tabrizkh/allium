"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageSquare, ShoppingCart, User, MapPin, Package, Heart, X, Check, Trash2, Plus, Info, ChevronDown, Gift, LogIn, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createOrder } from "@/app/actions/orders";
import { useShopStore } from "@/store/useShopStore";
import Image from "next/image";
import Link from "next/link";

type Packaging = {
  id: string;
  name: string;
  name_en?: string | null;
  name_az?: string | null;
  price: number;
  image: string | null;
  isAvailable: boolean;
  categoryId: string;
};

type CardTemplate = {
  id: string;
  text: string;
  text_en?: string | null;
  text_az?: string | null;
  recipient: string;
};

export default function CheckoutForm({ packaging = [], cardTemplates = [] }: { packaging?: Packaging[], cardTemplates?: CardTemplate[] }) {
  const { cart, products, clearCart, user, categories } = useShopStore();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const lang = i18n.language;

  // Addons state
  const [selectedPackagingId, setSelectedPackagingId] = useState<string | null>(null);
  const [addCard, setAddCard] = useState(false);
  const [cardText, setCardText] = useState("");
  const [cardRecipient, setCardRecipient] = useState("");

  const RECIPIENT_KEYS = ["mom", "wife", "girlfriend", "daughter", "colleague", "husband", "grandma", "sister", "other"];

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

  // itemPackaging: { [cartItemId]: { [indexInQuantity]: packagingId } }
  // or { [cartItemId]: packagingId } if "all in one"
  const [itemPackaging, setItemPackaging] = useState<Record<string, any>>({});
  const [packagingPopupItem, setPackagingPopupItem] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showGuestNotice, setShowGuestNotice] = useState(false);

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

  const getOptionName = (productId: string, attrId: string, optId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return "";
    const category = categories.find(c => c.id === product.categoryId);
    if (!category) return "";
    const attr = category.attributes?.find(a => a.id === attrId);
    if (!attr) return "";
    const opt = attr.options.find(o => o.id === optId);
    if (!opt) return "";
    return lang === 'az' ? opt.name_az || opt.name : lang === 'en' ? opt.name_en || opt.name : opt.name;
  };

  const renderOptions = (item: any) => {
    if (!item.selectedOptions) return null;
    return Object.entries(item.selectedOptions as Record<string, string | string[]>).map(([attrId, val]) => {
      const attrName = getAttributeName(item.productId, attrId);
      const optIds = Array.isArray(val) ? val : [val];
      if (optIds.length === 0) return null;
      return (
        <span key={attrId} className="text-[10px] text-[var(--accent)] opacity-70">
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
    if (!attr) return "";
    return lang === 'az' ? attr.name_az || attr.name : lang === 'en' ? attr.name_en || attr.name : attr.name;
  };

  const subtotal = useMemo(() => {
    const cartItems = Array.isArray(cart) ? cart : [];
    return cartItems.reduce((acc, item) => {
      return acc + (item.price || 0) * item.quantity;
    }, 0);
  }, [cart]);

  const totalPackagingPrice = useMemo(() => {
    let sum = 0;
    Object.entries(itemPackaging).forEach(([cartItemId, pkgData]) => {
      if (typeof pkgData === 'string') {
        // One packaging for all items of this type
        const pkg = packaging.find(p => p.id === pkgData);
        if (pkg) sum += pkg.price;
      } else if (typeof pkgData === 'object') {
        // Individual packaging per item unit
        Object.values(pkgData).forEach((pkgId: any) => {
          const pkg = packaging.find(p => p.id === pkgId);
          if (pkg) sum += pkg.price;
        });
      }
    });
    return sum;
  }, [itemPackaging, packaging]);

  const total = subtotal + totalPackagingPrice;

  if (!mounted) return null;

  const cartItems = Array.isArray(cart) ? cart : [];

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-serif mb-4">{t('cart.empty')}</h2>
        <Link href="/" className="text-[var(--accent)] hover:underline">
          {mounted ? t('footer.catalog') : "Вернуться в магазин"}
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validation: Check if packaging or card is missing
    const hasPackaging = Object.keys(itemPackaging).length > 0;
    const hasCard = addCard && cardText.trim().length > 0;

    if (!hasPackaging && !hasCard && !showConfirmModal) {
      setShowConfirmModal(true);
      return;
    }

    setLoading(true);

    try {
      const result = await createOrder({
        items: cartItems.map((item) => ({ 
          productId: item.productId, 
          quantity: item.quantity,
          options: {
            ...(item.selectedOptions as object),
            packaging: itemPackaging[item.id]
          }
        })),
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
          cardText: addCard ? cardText : undefined,
          cardRecipient: addCard ? cardRecipient : undefined,
        }
      });

      if (result.success) {
        clearCart();
        toast.success(mounted ? t('auth_panel.success.order') : "Заказ успешно оформлен!");
        
        if (!user) {
          setShowGuestNotice(true);
        } else {
          router.push("/profile");
        }
      } else {
        if (result.isProductNotFound) {
          toast.error(mounted ? t('checkout.product_not_found') : "Некоторые товары в вашей корзине устарели. Корзина будет очищена.");
          clearCart();
          setTimeout(() => router.push("/"), 2000);
        } else {
          toast.error(result.error || (mounted ? t('checkout.error') : "Ошибка при оформлении заказа"));
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(mounted ? t('auth_panel.errors.general_error') : "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = cardRecipient 
    ? cardTemplates.filter(t => t.recipient.toLowerCase() === cardRecipient.toLowerCase())
    : [];

  const getTemplateDisplay = (text: string) => {
    const words = text.split(' ');
    if (words.length <= 4) return text;
    return words.slice(0, 4).join(' ') + '...';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Order Summary & Addons */}
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-serif mb-6 flex items-center gap-2">
            <Gift className="w-6 h-6 text-[var(--accent)]" />
            {t('checkout.your_order')}
          </h2>
          <div className="bg-[var(--accent-strong)]/5 rounded-2xl p-6 border border-[var(--accent-strong)]/10 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex flex-col border-b border-[var(--accent-strong)]/10 last:border-0 pb-4 last:pb-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[var(--accent-strong)]/10 rounded-lg overflow-hidden relative">
                      <Image
                        src={item.image || "/placeholder.jpg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--foreground)]">{item.name}</h3>
                      
                      {/* Selected Options */}
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {renderOptions(item)}
                      </div>

                      <p className="text-sm text-[var(--accent)] font-medium">
                        {t('common.items_count', { count: item.quantity })} × {item.price} ₼
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[var(--foreground)]">
                      {t('common.price_manat', { price: (item.price * item.quantity).toFixed(2) })}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPackagingPopupItem(item)}
                      className="mt-1 text-[10px] bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-1.5 rounded-lg font-bold hover:bg-[var(--accent)]/20 transition-all flex items-center gap-1 ml-auto shadow-sm"
                    >
                      <Gift size={10} />
                      {itemPackaging[item.id] ? t('checkout.change_packaging') : t('checkout.add_packaging')}
                    </button>
                  </div>
                </div>
                
                {/* Display Current Packaging for this item */}
                {itemPackaging[item.id] && (
                  <div className="mt-2 pl-20 flex flex-wrap gap-2">
                    {Object.entries(itemPackaging[item.id]).map(([idx, pkgId]: any) => {
                      const pkg = packaging.find(p => p.id === pkgId);
                      const pkgName = pkg ? (lang === 'az' ? pkg.name_az || pkg.name : lang === 'en' ? pkg.name_en || pkg.name : pkg.name) : "";
                      return (
                        <div key={idx} className="text-[10px] bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-1 rounded-md border border-[var(--accent)]/10 flex items-center gap-1 font-medium">
                          <Check size={10} />
                          {item.quantity > 1 ? `${mounted ? t('checkout.item_number', { number: Number(idx) + 1 }) : `Товар #${Number(idx)+1}`}: ` : ""}{pkgName}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
            
            {totalPackagingPrice > 0 && (
              <div className="flex justify-between items-center pt-4 border-t border-[var(--accent-strong)]/10 text-[var(--accent)] font-medium">
                <div className="flex items-center gap-2">
                   <Gift size={16} />
                   <span>{t('checkout.packaging_total')}</span>
                </div>
                <div>{t('common.price_manat', { price: totalPackagingPrice.toFixed(2) })}</div>
              </div>
            )}

            <div className="flex justify-between items-center text-xl font-bold border-t border-[var(--accent-strong)]/20 pt-4 mt-4 text-[var(--foreground)]">
              <span>{t('checkout.total')}:</span>
              <span className="text-[var(--accent)]">{t('common.price_manat', { price: total.toFixed(2) })}</span>
            </div>
          </div>
        </section>

      {/* Card Selection */}
        <section className="bg-[var(--accent-strong)]/5 rounded-2xl p-6 border border-[var(--accent-strong)]/10">
          <div className="flex items-center justify-between">
             <h3 className="text-xl font-serif flex items-center gap-2">
               <MessageSquare className="w-5 h-5 text-[var(--accent)]" />
               {t('checkout.add_card')}
             </h3>
             <label className="relative inline-flex items-center cursor-pointer">
               <input type="checkbox" checked={addCard} onChange={(e) => setAddCard(e.target.checked)} className="sr-only peer" />
               <div className="w-11 h-6 bg-[var(--accent-strong)]/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
             </label>
          </div>

          {addCard && (
            <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label className="text-sm font-medium mb-2 block text-[var(--foreground)]/60">{t('checkout.card_recipient')}</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {RECIPIENT_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCardRecipient(key)}
                      className={`px-2 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                        cardRecipient === key
                          ? "border-[var(--accent-strong)] bg-[var(--accent-strong)]/20 text-[var(--foreground)]"
                          : "border-[var(--accent-strong)]/20 bg-[var(--background)] text-[var(--accent)] hover:bg-[var(--accent-strong)]/5"
                      }`}
                    >
                      {mounted ? t(`auth_panel.recipients.${key}`) : key}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-[var(--foreground)]/60">{t('checkout.card_text')}</label>
                <textarea
                  value={cardText}
                  onChange={(e) => setCardText(e.target.value)}
                  placeholder={t('checkout.card_placeholder')}
                  className="w-full rounded-xl border border-[var(--accent-strong)]/20 bg-[var(--background)] p-3 h-24 focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-[var(--foreground)]"
                />
              </div>

              {/* Templates */}
              {cardRecipient && filteredTemplates.length > 0 && (
                <div>
                   <label className="text-xs font-medium mb-2 block text-[var(--accent)] uppercase tracking-wider">{t('checkout.templates')} "{mounted ? t(`auth_panel.recipients.${cardRecipient}`) : cardRecipient}"</label>
                   <div className="flex flex-wrap gap-2">
                     {filteredTemplates.slice(0, 8).map(t => (
                       <button
                         key={t.id}
                         type="button"
                         onClick={() => setCardText(lang === 'az' ? t.text_az || t.text : lang === 'en' ? t.text_en || t.text : t.text)}
                         className="text-xs border border-[var(--accent-strong)]/20 px-3 py-1.5 rounded-lg hover:bg-[var(--accent)]/10 text-left transition-all bg-[var(--background)] shadow-sm text-[var(--foreground)]/80"
                         title={lang === 'az' ? t.text_az || t.text : lang === 'en' ? t.text_en || t.text : t.text}
                       >
                         {getTemplateDisplay(lang === 'az' ? t.text_az || t.text : lang === 'en' ? t.text_en || t.text : t.text)}
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
        <h2 className="text-2xl font-serif mb-6">{mounted ? t('checkout.form.title') : "Оформление"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('checkout.form.name')}</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-[var(--accent-strong)]/20 bg-[var(--background)] p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-[var(--foreground)]"
              placeholder={t('checkout.form.name')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('checkout.form.email')}</label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-xl border border-[var(--accent-strong)]/20 bg-[var(--background)] p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-[var(--foreground)]"
              placeholder={t('checkout.form.email')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('checkout.form.phone')}</label>
            <input
              required
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-xl border border-[var(--accent-strong)]/20 bg-[var(--background)] p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-[var(--foreground)]"
              placeholder="+994..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium mb-1">{t('checkout.form.city')}</label>
                <input
                  required
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full rounded-xl border border-[var(--accent-strong)]/20 bg-[var(--background)] p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-[var(--foreground)]"
                />
             </div>
             <div>
                <label className="block text-sm font-medium mb-1">{t('checkout.form.address')}</label>
                <input
                  required
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-xl border border-[var(--accent-strong)]/20 bg-[var(--background)] p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-[var(--foreground)]"
                  placeholder={mounted ? t('checkout.form.address_placeholder') : "Улица, дом, кв."}
                />
             </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('checkout.form.comment')}</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="w-full rounded-xl border border-[var(--accent-strong)]/20 bg-[var(--background)] p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent)] h-24 text-[var(--foreground)]"
              placeholder={t('checkout.form.comment_placeholder')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--accent)] text-white py-4 rounded-xl font-medium text-lg hover:opacity-90 transition mt-6 disabled:opacity-50 cursor-pointer shadow-lg"
          >
            {loading ? t('checkout.form.loading') : t('checkout.form.submit')}
          </button>
        </form>
        {/* Confirm Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowConfirmModal(false)} />
            <div className="relative w-full max-w-md bg-[var(--background)] border border-[var(--accent-strong)]/20 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
              <div className="w-20 h-20 bg-[var(--accent)]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--accent)]">
                <Info size={40} />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-4 text-[var(--foreground)]">{t('checkout.confirm_modal.title')}</h3>
              <p className="text-[var(--foreground)]/60 mb-8 leading-relaxed">
                {t('checkout.confirm_modal.text')}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleSubmit()}
                  className="w-full py-4 bg-[var(--accent)] text-white rounded-xl font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  {t('checkout.confirm_modal.confirm')}
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full py-4 bg-[var(--accent-strong)]/10 text-[var(--foreground)] rounded-xl font-bold hover:bg-[var(--accent-strong)]/20 transition-all"
                >
                  {t('checkout.confirm_modal.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Guest Registration Notice */}
        {showGuestNotice && (
          <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <div className="relative w-full max-w-md bg-[var(--background)] border border-[var(--accent-strong)]/20 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-4 text-[var(--foreground)]">{t('checkout.guest_notice.title')}</h3>
              <p className="text-[var(--foreground)]/60 mb-8 leading-relaxed">
                {t('checkout.guest_notice.text')}
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/auth/register"
                  className="w-full py-4 bg-[var(--accent)] text-white rounded-xl font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <LogIn size={20} /> {t('checkout.guest_notice.register')}
                </Link>
                <button
                  onClick={() => router.push("/")}
                  className="w-full py-4 bg-[var(--accent-strong)]/10 text-[var(--foreground)] rounded-xl font-bold hover:bg-[var(--accent-strong)]/20 transition-all"
                >
                  {t('checkout.guest_notice.later')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <CheckoutPackagingPopup 
        item={packagingPopupItem}
        packaging={packaging}
        products={products}
        onClose={() => setPackagingPopupItem(null)}
        currentSelection={packagingPopupItem ? itemPackaging[packagingPopupItem.id] : null}
        onSelect={(selection) => {
          setItemPackaging(prev => ({
            ...prev,
            [packagingPopupItem.id]: selection
          }));
          setPackagingPopupItem(null);
        }}
      />
    </div>
  );
}

function CheckoutPackagingPopup({ 
  item, 
  packaging, 
  products, 
  onClose, 
  onSelect, 
  currentSelection 
}: { 
  item: any; 
  packaging: any[]; 
  products: any[]; 
  onClose: () => void; 
  onSelect: (selection: any) => void; 
  currentSelection: any;
}) {
  const [tempSelection, setTempSelection] = useState<any>({});
  const { t } = useTranslation();

  useEffect(() => {
    if (item) {
      if (typeof currentSelection === 'object' && currentSelection !== null) {
        setTempSelection(currentSelection);
      } else {
        setTempSelection({});
      }
    }
  }, [item, currentSelection]);

  if (!item) return null;

  // Find categoryId from item or fallback to products list
  const categoryId = item.categoryId || products.find((p: any) => p.id === item.productId)?.categoryId;
  const productPackaging = packaging.filter((p: any) => p.categoryId === categoryId);

  const handleSave = () => {
    onSelect(tempSelection);
  };

  const applySameToAll = (pkgId: string) => {
    const next: any = {};
    for (let i = 0; i < item.quantity; i++) {
      next[i] = pkgId;
    }
    setTempSelection(next);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[var(--background)] border border-[var(--accent-strong)]/20 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-[var(--accent-strong)]/10 flex items-center justify-between bg-[var(--accent-strong)]/5">
          <div>
            <h3 className="text-lg font-bold">{t('packaging_popup.title')}</h3>
            <p className="text-xs text-[var(--foreground)]/50">{item.name} ({t('common.items_count', { count: item.quantity })})</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--accent-strong)]/10 rounded-full transition text-[var(--foreground)]/60"><X size={20}/></button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          <div className="space-y-6">
            {/* Same for all quick selector */}
            {item.quantity > 1 && (
              <div className="p-4 bg-[var(--accent-strong)]/5 rounded-2xl border border-[var(--accent-strong)]/10 space-y-3">
                <div className="text-[10px] font-bold text-[var(--accent)] uppercase">{t('packaging_popup.same_to_all')}</div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {productPackaging.map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => applySameToAll(p.id)}
                      className="flex-shrink-0 px-3 py-1.5 bg-[var(--background)] border border-[var(--accent-strong)]/10 rounded-full text-[10px] font-bold hover:bg-[var(--accent-strong)]/20 transition shadow-sm text-[var(--foreground)]"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {Array.from({ length: item.quantity }).map((_, idx) => (
              <div key={idx} className="space-y-2 border-b border-[var(--accent-strong)]/5 pb-4 last:border-0 last:pb-0">
                <div className="text-[10px] font-bold text-[var(--foreground)]/40 uppercase tracking-widest">
                  {item.quantity > 1 ? `Товар #${idx + 1}` : t('packaging_popup.title')}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {productPackaging.map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => setTempSelection({ ...tempSelection, [idx]: p.id })}
                      className={`flex-shrink-0 w-24 p-2 rounded-xl border-2 transition-all text-left ${tempSelection?.[idx] === p.id ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--accent-strong)]/10 hover:border-[var(--accent-strong)]/30'}`}
                    >
                      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-[var(--accent-strong)]/5 mb-1">
                         {p.image ? (
                           <Image src={p.image} alt={p.name} fill className="object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-[var(--foreground)]/20"><Package size={16} /></div>
                         )}
                      </div>
                      <div className="text-[10px] font-bold truncate text-[var(--foreground)]">{p.name}</div>
                      <div className="text-[8px] text-[var(--foreground)]/60">{t('common.price_manat', { price: p.price })}</div>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      const next = { ...tempSelection };
                      delete next[idx];
                      setTempSelection(next);
                    }}
                    className={`flex-shrink-0 w-24 p-2 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-1 ${!tempSelection?.[idx] ? 'border-[var(--accent-strong)]/40 bg-[var(--accent-strong)]/5 text-[var(--foreground)]/60' : 'border-[var(--accent-strong)]/10 text-[var(--foreground)]/30 hover:border-[var(--accent-strong)]/30'}`}
                  >
                    <X size={14}/>
                    <span className="text-[9px] font-bold uppercase">{t('packaging_popup.no_packaging')}</span>
                  </button>
                </div>
              </div>
            ))}
            
            {productPackaging.length === 0 && (
              <div className="text-center py-8 text-[var(--foreground)]/40 border-2 border-dashed border-[var(--accent-strong)]/10 rounded-2xl">
                {t('packaging_popup.no_found')}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-[var(--accent-strong)]/10 bg-[var(--accent-strong)]/5 flex gap-3">
           <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-[var(--foreground)]/50 hover:text-[var(--foreground)] hover:underline transition-all">{t('packaging_popup.cancel')}</button>
           <button 
            onClick={handleSave}
            className="flex-[2] py-3 bg-[var(--accent)] text-white rounded-xl text-sm font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all"
           >
             {t('packaging_popup.save')}
           </button>
        </div>
      </div>
    </div>
  );
}
