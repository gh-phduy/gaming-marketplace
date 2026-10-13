import { notFound } from "next/navigation";
import { DirectTopUpDetailClient } from "@/components/home/directtopup/detail/DirectTopUpDetailClient";
import {
  TOPUP_GAME_DETAILS,
  type TopUpGameDetail,
} from "@/components/home/directtopup/detail/topup-detail-data";

// Match the top-up index: locale configuration is resolved per request.
// Generating only category/slug without locale made production fallback renders fail.
export const dynamic = "force-dynamic";

type DirectTopUpGamePageProps = {
  params: Promise<{
    category: string;
    slug: string;
  }>;
};

export default async function DirectTopUpGamePage({
  params,
}: DirectTopUpGamePageProps) {
  const { category, slug } = await params;
  const game = TOPUP_GAME_DETAILS[slug as TopUpGameDetail["slug"]];

  if (!game) {
    notFound();
  }

  // Verify the category in the URL matches the game's actual category path
  const expectedCategory =
    game.category === "services" ? "services" : `${game.category}-games`;
  if (category !== expectedCategory) {
    notFound();
  }

  return <DirectTopUpDetailClient game={game} />;
}
