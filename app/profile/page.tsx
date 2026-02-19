import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserOrders } from "@/app/actions/orders";
import { getUserAddresses, getFavoritesAction } from "@/app/actions/user";
import ProfilePageContent from "@/components/profile/ProfilePageContent";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const { user } = session;
  const orders = await getUserOrders();
  const addresses = await getUserAddresses();
  const favorites = await getFavoritesAction();

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 max-w-6xl mx-auto text-[var(--foreground)]">
      <ProfilePageContent 
        user={user} 
        orders={orders} 
        addresses={addresses} 
        favorites={favorites} 
      />
    </main>
  );
}
