"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  saveCheckoutOrderSnapshot,
  type CheckoutOrderSnapshot,
} from "@/components/checkout/checkout-session";
import type { TopUpGameDetail } from "./topup-detail-data";
import { validateTopUpSelection } from "@/lib/payments/topup";
import { useRouter as useLocaleRouter } from "@/i18n/routing";

export function useDirectTopUp(game: TopUpGameDetail) {
  const router = useLocaleRouter();
  const { user } = useAuth();
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState(
    game.packages[0].id
  );
  
  const selectedPackage =
    game.packages.find((item) => item.id === selectedPackageId) ??
    game.packages[0];

  const handleCheckout = () => {
    let topUp;
    try {
      topUp = validateTopUpSelection({ gameSlug: game.slug, packageId: selectedPackage.id, fields }).selection;
    } catch {
      setError("Please fill in all player details before checkout.");
      return;
    }
    if (!user) {
      window.dispatchEvent(new CustomEvent("difmark:open-login"));
      return;
    }
    const snapshot: CheckoutOrderSnapshot = {
      topUp,
      items: [
        {
          id: selectedPackage.id,
          name: `${game.title} - ${selectedPackage.label}`,
          platform: "Direct Top Up",
          image: game.iconImage,
          price: selectedPackage.price,
          currency: "$",
          quantity: 1,
        },
      ],
      subtotal: selectedPackage.price,
      total: selectedPackage.price,
      currency: "$",
      createdAt: new Date().toISOString(),
    };

    saveCheckoutOrderSnapshot(snapshot);
    router.push("/checkout?directTopUp=1");
  };

  return {
    fields,
    error,
    setField: (id: string, value: string) => { setFields(current => ({ ...current, [id]: value })); setError(null); },
    selectedPackageId,
    setSelectedPackageId,
    selectedPackage,
    handleCheckout,
  };
}
