import StoryList from "@/components/admin/StoryList";
import { prisma } from "@/lib/prisma";

export default async function StoriesPage() {
  const stories = await prisma.story.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <StoryList stories={stories} />;
}
