import { getAdminReviews } from "@/app/actions/reviews";
import ReviewList from "@/components/admin/ReviewList";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews();

  return <ReviewList reviews={reviews} />;
}
