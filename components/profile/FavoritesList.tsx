import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ProductPopup from "../ProductPopup";

export default function FavoritesList({ favorites }: { favorites: any[] }) {
  const { t } = useTranslation();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  if (favorites.length === 0) {
    return (
      <div className="bg-[var(--accent-strong)]/5 border border-[var(--accent-strong)]/20 rounded-2xl p-12 text-center text-[var(--accent-strong)] flex flex-col items-center gap-4">
        <Heart size={48} strokeWidth={1} />
        <p className="text-lg">{t('favorites.empty')}</p>
        <Link href="/" className="mt-2 bg-[var(--accent-strong)] text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition font-medium">
          {t('header.catalog')}
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {favorites.map((fav) => {
          const product = fav.product;
          const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
          
          return (
            <div 
              key={fav.id} 
              onClick={() => setSelectedProduct(product)}
              className="block group bg-[var(--accent-strong)]/5 border border-[var(--accent-strong)]/20 rounded-xl overflow-hidden hover:shadow-lg hover:border-[var(--accent-strong)]/40 transition duration-300 cursor-pointer"
            >
              <div className="aspect-square relative bg-gray-100">
                {images?.[0] ? (
                  <Image src={images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300"><Heart size={24} /></div>
                )}
                <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full text-[var(--accent-strong)] opacity-100 transition shadow-sm">
                    <Heart size={16} fill="currentColor" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-[var(--foreground)] truncate mb-1">{product.name}</h3>
                <div className="text-[var(--accent-strong)] font-bold">{Number(product.price)} ₼</div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedProduct && (
        <ProductPopup 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </>
  );
}
