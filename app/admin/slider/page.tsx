import SliderList from "@/components/admin/SliderList";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SliderPage() {
  const items = await prisma.sliderItem.findMany({
    orderBy: { order: "asc" },
  });

  // Convert Decimals if any, but SliderItem doesn't have Decimals currently.
  // We just need to make sure it matches the type expected by the component.
  const serializedItems = items.map((item: any) => ({
    ...item,
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    description: item.description,
    imageUrl: item.imageUrl,
    buttonText: item.buttonText,
    buttonLink: item.buttonLink,
    isActive: item.isActive,
  }));

  return <SliderList items={serializedItems} />;
}
