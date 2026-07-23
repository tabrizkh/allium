
import OrderList from "@/components/admin/OrderList";
import { getAllOrders } from "@/app/actions/orders";
import { getAllPackaging } from "@/app/actions/addons";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const [ordersRaw, packagingRaw] = await Promise.all([
    getAllOrders(),
    getAllPackaging()
  ]);

  const packagingMap = packagingRaw.reduce((acc: any, p: any) => {
    acc[p.id] = p.name;
    return acc;
  }, {});

  // Convert Decimals to numbers for client component
  const orders = ordersRaw.map((order: any) => ({
    ...order,
    total: Number(order.total),
    items: order.items.map((item: any) => ({
      ...item,
      price: Number(item.price),
      product: item.product ? {
        ...item.product,
        price: Number(item.product.price),
        images: item.product.images ? JSON.parse(item.product.images) : [],
      } : null
    })),
    packaging: order.packaging ? {
      ...order.packaging,
      price: Number(order.packaging.price)
    } : null
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif font-bold">Управление заказами</h1>
      <OrderList initialOrders={orders as any} packagingMap={packagingMap} />
    </div>
  );
}
