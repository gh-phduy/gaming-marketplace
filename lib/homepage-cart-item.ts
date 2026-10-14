import type { CartItemInput } from "@/contexts/CartContext";
import type { HomepageGame } from "./homepage-products";

export function getHomepageCartItem(game: HomepageGame): CartItemInput {
  return {
    id: game.id,
    name: game.title,
    image: game.image_url,
    platform: game.platform,
    price: Number(game.price),
    currency: game.currency,
  };
}
