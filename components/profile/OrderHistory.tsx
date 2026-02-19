import Image from "next/image";
import { Package, Gift, MessageSquare } from "lucide-react";

export default function OrderHistory({ orders }: { orders: any[] }) {
  if (orders.length === 0) {
    return (
      <div className="bg-white border border-[var(--accent)]/20 rounded-2xl p-12 text-center text-[var(--accent)] flex flex-col items-center gap-4">
        <Package size={48} strokeWidth={1} />
        <p className="text-lg">История заказов пока пуста.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div key={order.id} className="bg-white border border-[var(--accent)]/20 rounded-2xl overflow-hidden shadow-sm transition hover:shadow-md">
          {/* Header */}
          <div className="bg-[var(--accent)]/5 p-4 flex flex-wrap justify-between items-center gap-4 border-b border-[var(--accent)]/10">
            <div className="flex gap-4 items-center">
               <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[var(--accent)] shadow-sm">
                  <Package size={20} />
               </div>
               <div>
                  <div className="text-xs text-[var(--accent)] uppercase tracking-wider font-medium">Заказ №{order.id.slice(-6)}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("ru-RU", { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
               </div>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
              order.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
              order.status === "PAID" ? "bg-green-100 text-green-700" :
              order.status === "DELIVERED" ? "bg-blue-100 text-blue-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              {order.status === "PENDING" ? "В обработке" :
               order.status === "PAID" ? "Оплачен" :
               order.status === "DELIVERED" ? "Доставлен" : order.status}
            </div>
          </div>
          
          <div className="p-6">
            {/* Items */}
            <div className="space-y-4 mb-6">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 group">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden relative flex-shrink-0 border border-gray-100">
                     {item.product?.images?.[0] ? (
                         <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover group-hover:scale-105 transition duration-500" />
                     ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={20} /></div>
                     )}
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="font-serif font-medium text-lg truncate">{item.product?.name || "Товар удален"}</div>
                     <div className="text-sm text-[var(--accent)] font-medium">{item.quantity} шт. × {Number(item.price)} ₼</div>
                  </div>
                  <div className="font-bold text-lg">{(Number(item.price) * item.quantity).toFixed(2)} ₼</div>
                </div>
              ))}
            </div>

            {/* Addons Info */}
            {(order.packaging || order.cardText) && (
               <div className="mb-6 bg-[var(--accent)]/5 rounded-xl p-4 space-y-3 text-sm">
                  {order.packaging && (
                    <div className="flex items-center gap-3">
                       <Gift size={16} className="text-[var(--accent)]" />
                       <span className="font-medium">Упаковка:</span>
                       <span>{order.packaging.name} ({Number(order.packaging.price)} ₼)</span>
                    </div>
                  )}
                  {order.cardText && (
                    <div className="flex items-start gap-3">
                       <MessageSquare size={16} className="text-[var(--accent)] mt-0.5" />
                       <div>
                          <span className="font-medium block">Открытка {order.cardRecipient ? `(для: ${order.cardRecipient})` : ''}:</span>
                          <p className="text-gray-600 italic mt-1">"{order.cardText}"</p>
                       </div>
                    </div>
                  )}
               </div>
            )}
            
            <div className="border-t border-dashed border-gray-200 pt-6 flex flex-wrap justify-between items-end gap-4">
              <div className="text-sm text-gray-500 max-w-md">
                 <div className="font-medium text-gray-900 mb-1">Адрес доставки:</div>
                 {order.city}, {order.address}
              </div>
              <div className="text-right">
                 <div className="text-sm text-gray-500 mb-1">Итоговая сумма</div>
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
