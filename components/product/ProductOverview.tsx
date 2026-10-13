"use client";

import { useCallback } from "react";
import { useRouter } from "@/i18n/routing";
import ProductGallery from "./ProductGallery";
import PurchaseCard from "./PurchaseCard";
import { ProductApiResponse } from "@/types/api-product";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "next-intl";
import { PRODUCT_OVERVIEW_CLASS } from "./product-layout";

interface ProductOverviewProps {
  data: ProductApiResponse;
}

export default function ProductOverview({ data }: ProductOverviewProps) {
  const t = useTranslations("product");
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = useCallback(() => {
    if (data?.data.id) {
      console.log("Add to cart:", data.data.id);
      addToCart({
        id: data.data.id,
        name: data.data.name,
        platform: data.data.platform,
        image: data.data.images[0] ?? "/battlefield_6.jpg",
        price: data.data.price,
        currency: data.data.currency,
      });
    }
  }, [addToCart, data?.data]);

  const handleCheckout = useCallback(() => {
    if (!user) {
      window.dispatchEvent(new CustomEvent("difmark:open-login"));
      return;
    }
    if (data?.data.id) {
      router.push(`/checkout?id=${data.data.id}`);
    }
  }, [data?.data.id, router, user]);

  const handleChat = useCallback(async () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent("difmark:open-login"));
      return;
    }

    if (!data?.seller.id || !data?.data.name) return;

    if (user.id === data.seller.id) {
      alert(t("cannotChatWithYourself"));
      return;
    }

    try {
      // 1. Check if conversation already exists
      const conversationResult = await supabase
        .from("conversations")
        .select("*")
        .eq("seller_id", data.seller.id)
        .eq("buyer_id", user.id)
        .eq("listing_title", data.data.name)
        .maybeSingle();
      const { error } = conversationResult;
      let { data: conversation } = conversationResult;

      if (error) {
        console.error("Error fetching conversation:", error);
      }

      // 2. If it doesn't exist, create it
      if (!conversation) {
        const { data: newConv, error: createError } = await supabase
          .from("conversations")
          .insert({
            seller_id: data.seller.id,
            buyer_id: user.id,
            listing_title: data.data.name,
          })
          .select()
          .single();

        if (createError) throw createError;
        conversation = newConv;
      }

      if (conversation) {
        // 3. Trigger global chat widget to open
        window.dispatchEvent(
          new CustomEvent("difmark:open-chat", {
            detail: {
              id: conversation.id,
              recipientId: data.seller.id,
              recipientName: data.seller.name,
              recipientAvatar: data.seller.avatar,
              listingTitle: data.data.name,
            },
          }),
        );
      }
    } catch (err) {
      console.error("Failed to initialize chat:", err);
      alert(t("failedToInitializeChat"));
    }
  }, [data, user, router, t]);

  return (
    <div className={PRODUCT_OVERVIEW_CLASS}>
      <ProductGallery
        images={data.data.images}
        name={data.data.name}
        platform={data.data.platform}
      />
      <PurchaseCard
        product={data.data}
        seller={data.seller}
        onAddToCart={handleAddToCart}
        onCheckout={handleCheckout}
        onChat={handleChat}
      />
    </div>
  );
}
