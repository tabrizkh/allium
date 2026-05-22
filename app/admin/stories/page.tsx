import StoryList from "@/components/admin/StoryList";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StoriesPage() {
  const [stories, categories] = await Promise.all([
    prisma.story.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return <StoryList stories={stories} categories={categories} />;
}
