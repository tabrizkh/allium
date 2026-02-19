"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

type CreateOrderParams = {
  items: { productId: string; quantity: number }[];
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

      const price = Number(product.price);
      calculatedTotal += price * item.quantity;

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price, // Store Decimal
      });
    }

    // Add packaging price if selected
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
  } catch (error) {
    console.error("Failed to create order:", error);
    return { success: false, error: "Failed to create order" };
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
