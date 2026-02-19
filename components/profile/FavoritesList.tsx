import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function FavoritesList({ favorites }: { favorites: any[] }) {
  if (favorites.length === 0) {
    return (
      <div className="bg-white border border-[var(--accent)]/20 rounded-2xl p-12 text-center text-[var(--accent)] flex flex-col items-center gap-4">
        <Heart size={48} strokeWidth={1} />
        <p className="text-lg">Список избранного пуст</p>
        <Link href="/" className="mt-2 bg-[var(--accent)] text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition font-medium">
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {favorites.map((fav) => (
        <Link key={fav.id} href={`/product/${fav.product.slug}`} className="block group bg-white border border-[var(--accent)]/20 rounded-xl overflow-hidden hover:shadow-lg hover:border-[var(--accent)]/40 transition duration-300">
          <div className="aspect-square relative bg-gray-100">
            {fav.product.images?.[0] ? (
              <Image src={fav.product.images[0]} alt={fav.product.name} fill className="object-cover group-hover:scale-105 transition duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300"><Heart size={24} /></div>
            )}
            <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full text-[var(--accent)] opacity-0 group-hover:opacity-100 transition shadow-sm">
                <Heart size={16} fill="currentColor" />
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-serif font-medium text-gray-900 truncate mb-1">{fav.product.name}</h3>
            <div className="text-[var(--accent)] font-bold">{Number(fav.product.price)} ₼</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
