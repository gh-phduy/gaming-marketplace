"use client";

import { useCart, type CartItemInput } from "@/contexts/CartContext";
import PopularGameCard from "@/components/home/PopularGameCard";
import UpcomingGameCard from "@/components/home/UpcomingGameCard";
import GameCard from "./GameCard";
import ResponsiveGameList from "./ResponsiveGameList";

interface HomepageCardData {
  item: CartItemInput;
  price: string;
  previewVideo?: string;
  releaseDate?: string;
  sellerName?: string;
  sellerAvatar?: string;
  sellerRank?: string;
}

/** One client boundary and cart subscription per list, with server-prepared text. */
export default function HomepageGameList({
  variant,
  games,
  label,
  layout,
}: {
  variant: "popular" | "upcoming" | "standard";
  games: HomepageCardData[];
  label: string;
  layout?: "grid" | "columns";
}) {
  const { addToCart } = useCart();
  return (
    <ResponsiveGameList label={label} layout={layout}>
      {games.map(
        ({
          item,
          price,
          previewVideo,
          releaseDate,
          sellerName,
          sellerAvatar,
          sellerRank,
        }) => {
          const props = {
            id: item.id,
            title: item.name,
            coverImage: item.image,
            platform: item.platform,
            price,
            previewVideo,
            onAddToCart: () => addToCart(item),
          };
          if (variant === "popular")
            return <PopularGameCard key={item.id} {...props} />;
          if (variant === "upcoming")
            return (
              <UpcomingGameCard
                key={item.id}
                {...props}
                releaseDate={releaseDate}
              />
            );
          return (
            <GameCard
              key={item.id}
              {...props}
              sellerName={sellerName}
              sellerAvatar={sellerAvatar}
              sellerRank={sellerRank}
            />
          );
        },
      )}
    </ResponsiveGameList>
  );
}
