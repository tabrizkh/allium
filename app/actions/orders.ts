"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

type CreateOrderParams = {
  items: { 
    productId: string; 
    quantity: number; 
    options?: Record<string, string>; // Selected options: { attrId: optId }
  }[];
  total: number;
  details: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    comment?: string;
  };
  addons?: {
    packagingId?: string;
    cardText?: string;
    cardRecipient?: string;
  };
};

export async function createOrder(params: CreateOrderParams) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const { items, total, details, addons } = params;

    // Validate products and recalculate total (security check)
    let calculatedTotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new Error(`Product with id ${item.productId} not found`);
      }

      const basePrice = Number(product.price);
      let extra = 0;

      // Calculate extra price from options (excluding packaging which is handled separately)
      if (item.options) {
        const productOptions = JSON.parse(product.productOptions || "{}") as Record<string, Record<string, number>>;
        Object.entries(item.options).forEach(([attrId, optId]) => {
          if (attrId === 'packaging') return;
          // Handle both single and multiple selections (if any)
          const optIds = Array.isArray(optId) ? optId : [optId];
          optIds.forEach(id => {
            extra += productOptions[attrId]?.[id] || 0;
          });
        });
      }

      const itemTotalPrice = basePrice + extra;
      let itemPackagingPrice = 0;

      // Handle Packaging from item options
      const packagingData = (item.options as any)?.packaging;
      if (packagingData) {
        if (typeof packagingData === 'string') {
          const pkg = await prisma.packaging.findUnique({ where: { id: packagingData } });
          if (pkg) itemPackagingPrice += Number(pkg.price);
        } else if (typeof packagingData === 'object') {
          for (const pkgId of Object.values(packagingData) as string[]) {
            const pkg = await prisma.packaging.findUnique({ where: { id: pkgId } });
            if (pkg) itemPackagingPrice += Number(pkg.price);
          }
        }
      }

      calculatedTotal += (itemTotalPrice * item.quantity) + itemPackagingPrice;

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: itemTotalPrice, // Store actual price at time of order
        options: JSON.stringify(item.options || {}),
      });
    }

    // Add legacy packaging price if selected (though UI should use per-item now)
    if (addons?.packagingId) {
      const packaging = await prisma.packaging.findUnique({
        where: { id: addons.packagingId },
      });
      if (packaging) {
        calculatedTotal += Number(packaging.price);
      }
    }

    // You might want to allow some tolerance or just use server-calculated total
    // For now, let's just use the server calculated total
    
    const order = await prisma.order.create({
      data: {
        userId: userId || null,
        total: calculatedTotal,
        status: "PENDING",
        name: details.name,
        email: details.email,
        phone: details.phone,
        address: details.address,
        city: details.city,
        comment: details.comment,
        packagingId: addons?.packagingId,
        cardText: addons?.cardText,
        cardRecipient: addons?.cardRecipient,
        items: {
          create: orderItemsData,
        },
      },
    });

    revalidatePath("/profile");
    revalidatePath("/admin/orders");

    return { success: true, orderId: order.id };
  } catch (error: any) {
    console.error("Failed to create order:", error);
    return { 
      success: false, 
      error: error.message || "Failed to create order",
      isProductNotFound: error.message?.includes("not found")
    };
  }
}

export async function getUserOrders() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      packaging: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return orders;
}

export async function getAllOrders() {
  const session = await auth();
  // Check for admin status - assuming your session/user has role info
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    // You might want to handle this differently, but for now just return empty if not admin
    // return [];
  }

  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: true,
        },
      },
      packaging: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return orders;
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    await prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Failed to update order status:", error);
    return { success: false, error: "Failed to update order status" };
  }
}
