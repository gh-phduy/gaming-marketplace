export interface UserDashboardProfile {
  id: string;
  username: string;
  avatarUrl: string;
  memberSince: string;
  isVerified: boolean;
  location: {
    name: string;
    flagCode: string;
  };
  language: {
    name: string;
    flagCode: string;
  };
  currency: {
    name: string;
    code: string;
    symbol: string;
    flagCode: string;
  };
  level: {
    current: "Novice" | "Expert" | "Master" | "Legend";
    progress: number; // 0-100
  };
  cashback: {
    currentPercent: number;
    maxPercent: number;
  };
  spent: {
    amount: number;
    currencySymbol: string;
    maxAmount: number;
  };
  reviews: {
    count: number;
    total: number;
  };
  wallet: {
    available: number;
    pending: number;
    bonus: number;
    currencySymbol: string;
  };
  recentOrders: OrderSummary[];
  quickActions: QuickAction[];
}

export interface OrderSummary {
  id: string;
  productName: string;
  date: string;
  status: "completed" | "pending" | "processing" | "cancelled" | "failed" | "refunded";
  amount: number;
  currencySymbol: string;
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

export function getDashboardProfile(): UserDashboardProfile {
  return {
    id: "",
    username: "",
    avatarUrl: "/avt1.png",
    memberSince: "Jul 2026",
    isVerified: false,
    location: {
      name: "Viet Nam",
      flagCode: "VN",
    },
    language: {
      name: "English",
      flagCode: "EN",
    },
    currency: {
      name: "US Dollar",
      code: "USD",
      symbol: "$",
      flagCode: "US",
    },
    level: {
      current: "Novice",
      progress: 0,
    },
    cashback: {
      currentPercent: 0,
      maxPercent: 0,
    },
    spent: {
      amount: 0.0,
      currencySymbol: "$",
      maxAmount: 0.0,
    },
    reviews: {
      count: 0,
      total: 0,
    },
    wallet: {
      available: 0.0,
      pending: 0.0,
      bonus: 0.0,
      currencySymbol: "$",
    },
    recentOrders: [],
    quickActions: [
      {
        id: "qa_orders",
        label: "My Orders",
        description: "View order history",
        icon: "shopping-bag",
        href: "/account/orders",
        color: "blue",
      },
      {
        id: "qa_wallet",
        label: "Wallet",
        description: "Manage your funds",
        icon: "wallet",
        href: "/account/wallet",
        color: "green",
      },
      {
        id: "qa_settings",
        label: "Settings",
        description: "Account preferences",
        icon: "settings",
        href: "/account/settings",
        color: "purple",
      },
      {
        id: "qa_tickets",
        label: "Support",
        description: "Get help",
        icon: "ticket",
        href: "/account/tickets",
        color: "orange",
      },
      {
        id: "qa_bookmarks",
        label: "Bookmarks",
        description: "Saved items",
        icon: "bookmark",
        href: "/account/bookmarks",
        color: "pink",
      },
      {
        id: "qa_verify",
        label: "Verification",
        description: "Verify identity",
        icon: "shield",
        href: "/account/verification",
        color: "cyan",
      },
    ],
  };
}
