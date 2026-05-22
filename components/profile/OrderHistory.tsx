import Image from "next/image";
import { Package, Gift, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function OrderHistory({ orders, packaging }: { orders: any[], packaging: any[] }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  if (orders.length === 0) {
    return (
      <div className="bg-[var(--panel-bg)] border border-[var(--accent)]/20 rounded-2xl p-12 text-center text-[var(--accent)] flex flex-col items-center gap-4">
        <Package size={48} strokeWidth={1} />
        <p className="text-lg">{t('profile.no_orders')}</p>
      </div>
    );
  }

  const getPackagingName = (id: string) => {
    const pkg = packaging.find(p => p.id === id);
    if (!pkg) return t('checkout.packaging_total');
    return lang === 'az' ? pkg.name_az || pkg.name : lang === 'en' ? pkg.name_en || pkg.name : pkg.name;
  };

  const renderItemPackaging = (item: any) => {
    try {
      const options = typeof item.options === 'string' ? JSON.parse(item.options) : (item.options || {});
      const pkgData = options.packaging;
      if (!pkgData) return null;

      if (typeof pkgData === 'string') {
        return (
          <div className="flex items-center gap-1 text-[10px] bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-0.5 rounded border border-[var(--accent)]/10 mt-1 w-fit">
            <Gift size={10} />
            <span>{t('checkout.packaging_total')}: {getPackagingName(pkgData)}</span>
          </div>
        );
      } else if (typeof pkgData === 'object') {
        return (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(pkgData).map(([idx, pkgId]: any) => (
              <div key={idx} className="flex items-center gap-1 text-[8px] bg-[var(--accent)]/10 text-[var(--accent)] px-1.5 py-0.5 rounded border border-[var(--accent)]/10 w-fit">
                <Gift size={8} />
                <span>#{Number(idx)+1}: {getPackagingName(pkgId)}</span>
              </div>
            ))}
          </div>
        );
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div key={order.id} className="bg-[var(--panel-bg)] border border-[var(--accent)]/20 rounded-2xl overflow-hidden shadow-sm transition hover:shadow-md">
          {/* Header */}
          <div className="bg-[var(--accent)]/5 p-4 flex flex-wrap justify-between items-center gap-4 border-b border-[var(--accent)]/10">
            <div className="flex gap-4 items-center">
               <div className="w-10 h-10 rounded-full bg-[var(--background)] flex items-center justify-center text-[var(--accent)] shadow-sm">
                  <Package size={20} />
               </div>
               <div>
                  <div className="text-xs text-[var(--accent)] uppercase tracking-wider font-medium">{t('profile.order_number', { number: order.id.slice(-6) })}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString(lang === 'az' ? 'az-AZ' : lang === 'en' ? 'en-US' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
               </div>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
              order.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
              order.status === "PAID" ? "bg-green-100 text-green-700" :
              order.status === "DELIVERED" ? "bg-blue-100 text-blue-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              {t(`profile.order_status.${order.status.toLowerCase()}`)}
            </div>
          </div>
          
          <div className="p-6">
            {/* Items */}
            <div className="space-y-4 mb-6">
              {order.items.map((item: any) => {
                const prodName = item.product 
                  ? (lang === 'az' ? item.product.name_az || item.product.name : lang === 'en' ? item.product.name_en || item.product.name : item.product.name)
                  : t('checkout.product_deleted');

                return (
                  <div key={item.id} className="flex flex-col border-b border-gray-50/10 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center gap-4 group">
                      <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden relative flex-shrink-0 border border-gray-100">
                        {item.product?.images ? (
                          <Image 
                            src={(typeof item.product.images === 'string' ? JSON.parse(item.product.images) : item.product.images)[0] || "/placeholder.jpg"} 
                            alt={prodName} 
                            fill 
                            className="object-cover group-hover:scale-105 transition duration-500" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={20} /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-serif font-medium text-lg truncate">{prodName}</div>
                        <div className="text-sm text-[var(--accent)] font-medium">{item.quantity} шт. × {Number(item.price)} ₼</div>
                        {renderItemPackaging(item)}
                      </div>
                      <div className="font-bold text-lg">{(Number(item.price) * item.quantity).toFixed(2)} ₼</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Addons Info */}
            {(order.packaging || order.cardText) && (
               <div className="mb-6 bg-[var(--accent)]/5 rounded-xl p-4 space-y-3 text-sm">
                  {order.packaging && (
                    <div className="flex items-center gap-3">
                       <Gift size={16} className="text-[var(--accent)]" />
                       <span className="font-medium">{t('checkout.packaging_total')} (общая):</span>
                       <span>{lang === 'az' ? order.packaging.name_az || order.packaging.name : lang === 'en' ? order.packaging.name_en || order.packaging.name : order.packaging.name} ({Number(order.packaging.price)} ₼)</span>
                    </div>
                  )}
                  {order.cardText && (
                    <div className="flex items-start gap-3">
                       <MessageSquare size={16} className="text-[var(--accent)] mt-0.5" />
                       <div>
                          <span className="font-medium block">{t('checkout.add_card')} {order.cardRecipient ? `(${t('checkout.card_recipient')} ${t(`auth_panel.recipients.${order.cardRecipient}`)})` : ''}:</span>
                          <p className="text-gray-600 italic mt-1">"{order.cardText}"</p>
                       </div>
                    </div>
                  )}
               </div>
            )}
            
            <div className="border-t border-dashed border-gray-200/20 pt-6 flex flex-wrap justify-between items-end gap-4">
              <div className="text-sm text-gray-500 max-w-md">
                 <div className="font-medium text-[var(--foreground)] mb-1">{t('checkout.form.address')}:</div>
                 {order.city}, {order.address}
              </div>
              <div className="text-right">
                 <div className="text-sm text-gray-500 mb-1">{t('checkout.total')}</div>
                 <div className="font-serif font-bold text-2xl text-[var(--accent)]">
                    {Number(order.total).toFixed(2)} ₼
                 </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
