"use client";

import { useEffect, useRef } from "react";
import { useShopStore } from "@/store/useShopStore";
import { Product, Category, SliderItem } from "@/lib/types";

export default function StoreInitializer({ 
  products, 
  categories, 
  sliderItems 
}: { 
  products: Product[], 
  categories: Category[], 
  sliderItems: SliderItem[] 
}) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      useShopStore.getState().setProducts(products);
      useShopStore.getState().setCategories(categories);
      useShopStore.getState().setSliderItems(sliderItems);
      initialized.current = true;
    }
  }, [products, categories, sliderItems]);

  return null;
}
