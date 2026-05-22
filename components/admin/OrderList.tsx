
"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/app/actions/orders";
import { 
  Package, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Gift, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Truck, 
  AlertCircle 
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function OrderList({ initialOrders, packagingMap = {} }: { initialOrders: any[], packagingMap?: Record<string, string> }) {
  const [orders, setOrders] = useState(initialOrders);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        toast.success("Статус заказа обновлен");
      } else {
        toast.error("Ошибка при обновлении статуса");
      }
    } catch (error) {
      toast.error("Произошла ошибка");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock size={16} className="text-yellow-500" />;
      case "PAID": return <CheckCircle2 size={16} className="text-green-500" />;
      case "DELIVERED": return <Truck size={16} className="text-blue-500" />;
      case "CANCELLED": return <AlertCircle size={16} className="text-red-500" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return "В обработке";
      case "PAID": return "Оплачен";
      case "DELIVERED": return "Доставлен";
      case "CANCELLED": return "Отменен";
      default: return status;
    }
  };

  const renderPackaging = (item: any) => {
    try {
      const options = typeof item.options === 'string' ? JSON.parse(item.options) : (item.options || {});
      const pkgData = options.packaging;
      if (!pkgData) return null;

      if (typeof pkgData === 'object') {
        return (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(pkgData).map(([idx, pkgId]: any) => (
              <div key={idx} className="flex items-center gap-1 text-[9px] bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-0.5 rounded-md border border-[var(--accent)]/10">
                <Gift size={10} />
                <span>#{Number(idx)+1}: {packagingMap[pkgId] || `Упаковка (${pkgId.slice(-4)})`}</span>
              </div>
            ))}
          </div>
        );
      } else if (typeof pkgData === 'string') {
        return (
          <div className="flex items-center gap-1 text-[9px] bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-0.5 rounded-md border border-[var(--accent)]/10 mt-1 w-fit">
            <Gift size={10} />
            <span>Упаковка: {packagingMap[pkgData] || `Упаковка (${pkgData.slice(-4)})`}</span>
          </div>
        );
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="bg-[var(--accent-strong)]/5 border border-[var(--accent-strong)]/10 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-6 p-4 bg-[var(--accent-strong)]/10 text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
          <div className="col-span-1">ID / Дата</div>
          <div className="col-span-2">Клиент</div>
          <div className="col-span-1">Сумма</div>
          <div className="col-span-1">Статус</div>
          <div className="col-span-1 text-right">Действия</div>
        </div>

        <div className="divide-y divide-[var(--accent-strong)]/10">
          {orders.map((order) => (
            <div key={order.id} className="group">
              <div 
                className={`grid grid-cols-6 p-4 items-center transition-colors cursor-pointer hover:bg-[var(--accent-strong)]/5 ${expandedOrderId === order.id ? 'bg-[var(--accent-strong)]/5' : ''}`}
                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
              >
                <div className="col-span-1">
                  <div className="font-bold text-sm">#{order.id.slice(-6)}</div>
                  <div className="text-[10px] text-[var(--foreground)]/40">
                    {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                  </div>
                </div>

                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                    <User size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{order.name}</div>
                    <div className="text-[10px] text-[var(--foreground)]/40 truncate">{order.phone}</div>
                  </div>
                </div>

                <div className="col-span-1 font-bold text-[var(--accent)]">
                  {order.total.toFixed(2)} ₼
                </div>

                <div className="col-span-1">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit text-[10px] font-bold uppercase tracking-wide border ${
                    order.status === "PENDING" ? "bg-yellow-50 text-yellow-600 border-yellow-100" :
                    order.status === "PAID" ? "bg-green-50 text-green-600 border-green-100" :
                    order.status === "DELIVERED" ? "bg-blue-50 text-blue-600 border-blue-100" :
                    "bg-red-50 text-red-600 border-red-100"
                  }`}>
                    {getStatusIcon(order.status)}
                    {getStatusLabel(order.status)}
                  </div>
                </div>

                <div className="col-span-1 text-right flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    className="bg-[var(--background)] border border-[var(--accent-strong)]/20 rounded-lg text-[10px] p-1.5 focus:ring-1 focus:ring-[var(--accent)] outline-none"
                  >
                    <option value="PENDING">В обработку</option>
                    <option value="PAID">Оплачен</option>
                    <option value="DELIVERED">Доставлен</option>
                    <option value="CANCELLED">Отменен</option>
                  </select>
                  <button className="p-2 hover:bg-[var(--accent-strong)]/10 rounded-lg transition text-[var(--foreground)]/60">
                    {expandedOrderId === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOrderId === order.id && (
                <div className="p-6 bg-[var(--background)] border-t border-[var(--accent-strong)]/10 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Items Section */}
                    <div className="md:col-span-2 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--foreground)]/40 flex items-center gap-2">
                        <Package size={14} /> Состав заказа
                      </h4>
                      <div className="space-y-3">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex gap-4 p-3 bg-[var(--accent-strong)]/5 rounded-2xl border border-[var(--accent-strong)]/10">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white border border-[var(--accent-strong)]/10">
                              {item.product?.images?.[0] ? (
                                <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[var(--foreground)]/20"><Package size={24} /></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-sm truncate">{item.product?.name || "Товар удален"}</div>
                              <div className="text-[10px] text-[var(--accent)] font-bold">{item.quantity} шт. × {item.price} ₼</div>
                              {renderPackaging(item)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Card Info */}
                      {(order.cardText || order.cardRecipient) && (
                        <div className="p-4 bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-2xl space-y-2">
                          <h4 className="text-[10px] font-bold uppercase text-[var(--accent)] flex items-center gap-2">
                            <MessageSquare size={12} /> Поздравление (открытка)
                          </h4>
                          <div className="text-xs font-medium text-[var(--foreground)]/60 italic">
                            {order.cardRecipient && <span className="block mb-1 not-italic font-bold">Для: {order.cardRecipient}</span>}
                            "{order.cardText}"
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Customer Info Section */}
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--foreground)]/40 flex items-center gap-2">
                          <MapPin size={14} /> Доставка и контакты
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex gap-3">
                            <div className="p-2 rounded-lg bg-[var(--accent-strong)]/5 text-[var(--foreground)]/40"><User size={16} /></div>
                            <div>
                              <div className="text-[10px] text-[var(--foreground)]/40 uppercase">Получатель</div>
                              <div className="font-medium">{order.name}</div>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="p-2 rounded-lg bg-[var(--accent-strong)]/5 text-[var(--foreground)]/40"><Phone size={16} /></div>
                            <div>
                              <div className="text-[10px] text-[var(--foreground)]/40 uppercase">Телефон</div>
                              <div className="font-medium">{order.phone}</div>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="p-2 rounded-lg bg-[var(--accent-strong)]/5 text-[var(--foreground)]/40"><Mail size={16} /></div>
                            <div>
                              <div className="text-[10px] text-[var(--foreground)]/40 uppercase">Email</div>
                              <div className="font-medium">{order.email}</div>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="p-2 rounded-lg bg-[var(--accent-strong)]/5 text-[var(--foreground)]/40"><Truck size={16} /></div>
                            <div>
                              <div className="text-[10px] text-[var(--foreground)]/40 uppercase">Адрес</div>
                              <div className="font-medium">{order.city}, {order.address}</div>
                            </div>
                          </div>
                          {order.comment && (
                            <div className="p-3 bg-yellow-50/50 border border-yellow-100 rounded-xl text-xs text-yellow-700">
                              <span className="font-bold block mb-1">Комментарий:</span>
                              {order.comment}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
