import { normalizeSellerRouteKey } from "./seller-profile.route";
import { supabase } from "@/lib/supabase";
import { withStoredSellerActivity } from "@/lib/seller-activity.server";

export interface SellerOfferItem {
  data: {
    id: string;
    name: string;
    type: string;
    platform: string;
    edition: string;
    delivery: string;
    activationRegion: string;
    price: number;
    currency: string;
    images: string[];
  };
  seller: {
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
    badge: string;
    tier: string;
    rating: number;
    successRate: number;
    totalFeedbacks: number;
    timezone: string;
    totalSales: number;
    positiveFeedbacks: number;
    negativeFeedbacks: number;
  };
}

export interface SellerReview {
  id: string;
  author: string;
  avatar: string;
  createdAt: string;
  rating: number;
  sentiment: "positive" | "negative";
  text: string;
  sellerReply?: string;
}

export interface SellerFollower {
  id: string;
  name: string;
  avatar: string;
  rank: string;
  location: string;
  locationFlag?: string;
  currency: string;
  followers: number;
  totalReviews: number;
  isFollowing: boolean;
}

export interface SellerProfile {
  id: string;
  name: string;
  avatar: string;
  banner: string;
  badge: string;
  tier: string;
  rating: number;
  successRate: number;
  totalFeedbacks: number;
  totalSales: number;
  positiveFeedbacks: number;
  negativeFeedbacks: number;
  timezone: string;
  currency: string;
  language: string;
  location: string;
  followers: number;
  memberSince: string;
  description: string;
  averagePrice: number;
  offerCount: number;
  offers: SellerOfferItem[];
  reviews: SellerReview[];
  followersList: SellerFollower[];
  followingList: SellerFollower[];
}

const EASY_KEY_SELLER = {
  id: "easy-key",
  name: "Easy-key",
  avatar: "/avt1.png",
  isOnline: true,
  badge: "Seller",
  tier: "Legendary",
  rating: 5,
  successRate: 98.6,
  totalFeedbacks: 1285,
  timezone: "UTC +02:00",
  totalSales: 43536,
  positiveFeedbacks: 98.6,
  negativeFeedbacks: 1.4,
};

const easyKeyImages = [
  "/popular-game/arc-raiders-pc.jpg",
  "/popular-game/battlefield-6-xbox-series.jpg",
  "/popular-game/call-of-duty-black-ops-7-pc.jpg",
  "/popular-game/code-vein-ii-pc.png",
  "/popular-game/high-on-life-2-pc.jpg",
  "/popular-game/mafia-the-old-country-pc.jpg",
  "/popular-game/nioh-3-pc.jpg",
  "/popular-game/reanimal-pc.jpg",
  "/cyberpunk_2077.jpg",
  "/battlefield_6.jpg",
];

const easyKeyTitles = [
  "Super Battle Golf",
  "Stray",
  "RoboCop: Rogue City - Collection",
  "Forza Horizon 6: Standard Edition",
  "Heavy Rain",
  "One-Eyed Likho",
  "DarkSwitch",
  "Arc Raiders Deluxe",
  "Battlefield 6",
  "Cyberpunk 2077 Ultimate Edition",
  "Mafia: The Old Country",
  "Nioh 3",
  "Reanimal",
  "Starfield Premium",
  "Hades II",
  "Dead Cells Return",
  "Forza Horizon 5",
  "Remnant II",
  "Sea of Stars",
  "Dave the Diver",
  "Valheim",
  "Astroneer",
  "Sifu",
  "Tunic",
  "Lies of P",
  "Payday 3",
  "Atomic Heart",
  "Dredge",
  "Risk of Rain 2",
  "The Last Campfire",
  "Cuphead Deluxe",
  "Grounded",
];

const easyKeyPrices = [
  5.01, 16.35, 47.71, 86.01, 20.75, 8.99, 16.3, 59.99, 69.99, 28.49,
  44.65, 56.4, 23.8, 63.9, 31.2, 12.75, 18.45, 33.1, 19.2, 15.6, 10.3,
  13.8, 22.15, 9.75, 39.99, 27.45, 34.6, 14.2, 11.5, 7.99, 16.49,
  21.25,
];

const easyKeyPlatforms = [
  "Steam",
  "Steam",
  "Steam",
  "Xbox Live",
  "Steam",
  "Steam",
  "Nintendo eShop",
  "Steam",
  "Xbox Live",
  "GOG",
  "Steam",
  "PlayStation Store",
];

const easyKeyReviews: SellerReview[] = [
  {
    id: "r-1",
    author: "marekadamski97",
    avatar: "/avt.jpg",
    createdAt: "3 days ago",
    rating: 5,
    sentiment: "positive",
    text: "I was worried that the pre-order would not arrive on time, but everything went smoothly and on time. I highly recommend this seller.",
  },
  {
    id: "r-2",
    author: "chainikoval",
    avatar: "/avt1.png",
    createdAt: "4 days ago",
    rating: 5,
    sentiment: "positive",
    text: "Fast answer, valid key, and clear instructions. Thank you.",
    sellerReply: "Thank you",
  },
  {
    id: "r-3",
    author: "ezlo97",
    avatar: "/spacex.jpg",
    createdAt: "12 days ago",
    rating: 5,
    sentiment: "positive",
    text: "Key worked, that is all you can ask for.",
  },
  {
    id: "r-4",
    author: "nic.pulickal",
    avatar: "/avt.jpg",
    createdAt: "13 days ago",
    rating: 5,
    sentiment: "positive",
    text: "All good, thank you!",
  },
  {
    id: "r-5",
    author: "RST",
    avatar: "/image.png",
    createdAt: "14 days ago",
    rating: 5,
    sentiment: "positive",
    text: "Easy-key delivered the activation key quickly and at a very good price.",
  },
  {
    id: "r-6",
    author: "pad3",
    avatar: "/avt1.png",
    createdAt: "16 days ago",
    rating: 5,
    sentiment: "positive",
    text: "Everything is excellent.",
  },
  {
    id: "r-7",
    author: "Nordin32",
    avatar: "/spacex.jpg",
    createdAt: "18 days ago",
    rating: 4,
    sentiment: "positive",
    text: "Delivery was fast. Support answered my platform question within minutes.",
  },
  {
    id: "r-8",
    author: "laksen",
    avatar: "/avt.jpg",
    createdAt: "20 days ago",
    rating: 5,
    sentiment: "positive",
    text: "Good seller, no extra steps needed.",
  },
  {
    id: "r-9",
    author: "foxlane",
    avatar: "/avt1.png",
    createdAt: "22 days ago",
    rating: 3,
    sentiment: "negative",
    text: "The key worked, but delivery took longer than I expected.",
    sellerReply: "Sorry for the delay. We added extra stock checks for this item.",
  },
  {
    id: "r-10",
    author: "redorbit",
    avatar: "/spacex.jpg",
    createdAt: "24 days ago",
    rating: 5,
    sentiment: "positive",
    text: "Clean purchase. I will buy again.",
  },
];

const easyKeyFollowers: SellerFollower[] = [
  {
    id: "f-1",
    name: "lehieuw123",
    avatar: "/avt1.png",
    rank: "Novice",
    location: "VN",
    locationFlag: "/vn.svg",
    currency: "USD",
    followers: 0,
    totalReviews: 0,
    isFollowing: false,
  },
  {
    id: "f-2",
    name: "daxchoi",
    avatar: "/avt.jpg",
    rank: "Novice",
    location: "VN",
    locationFlag: "/vn.svg",
    currency: "USD",
    followers: 2,
    totalReviews: 1,
    isFollowing: false,
  },
  {
    id: "f-3",
    name: "bosskeys",
    avatar: "/spacex.jpg",
    rank: "Expert",
    location: "DE",
    locationFlag: "/de.svg",
    currency: "EUR",
    followers: 48,
    totalReviews: 16,
    isFollowing: true,
  },
  {
    id: "f-4",
    name: "heroic.market",
    avatar: "/image.png",
    rank: "Master",
    location: "US",
    locationFlag: "/en.svg",
    currency: "USD",
    followers: 129,
    totalReviews: 42,
    isFollowing: false,
  },
  {
    id: "f-5",
    name: "greenkeys",
    avatar: "/avt1.png",
    rank: "Pro",
    location: "FI",
    locationFlag: "/fi.svg",
    currency: "EUR",
    followers: 23,
    totalReviews: 8,
    isFollowing: false,
  },
];

const PROFILE_META: Record<
  string,
  {
    memberSince: string;
    location: string;
    language: string;
    description: string;
  }
> = {
  S1: {
    memberSince: "8 Feb 2020",
    location: "FI",
    language: "EN",
    description:
      "Store focused on fast digital-key delivery with stable stock and responsive support.",
  },
  S2: {
    memberSince: "12 Jun 2021",
    location: "DE",
    language: "EN",
    description:
      "Premium PC and console offers curated daily for top-value deals.",
  },
  S3: {
    memberSince: "23 Jan 2019",
    location: "US",
    language: "EN",
    description:
      "Long-running marketplace seller with a broad global catalog and high completion rate.",
  },
  S4: {
    memberSince: "4 Nov 2022",
    location: "GB",
    language: "EN",
    description:
      "Trusted storefront for instant activation products and verified after-sales support.",
  },
};

const SELLER_MEDIA: Record<string, { banner: string; avatar: string }> = {
  S1: {
    banner: "/cyberpunk_2077.jpg",
    avatar: "/avt.jpg",
  },
  S2: {
    banner: "/battlefield_6.jpg",
    avatar: "/spacex.jpg",
  },
  S3: {
    banner: "/popular-game/call-of-duty-black-ops-7-pc.jpg",
    avatar: "/avt1.png",
  },
  S4: {
    banner: "/popular-game/reanimal-pc.jpg",
    avatar: "/avt.jpg",
  },
};

function createEasyKeyOffers(): SellerOfferItem[] {
  return easyKeyTitles.map((name, index) => ({
    data: {
      id: `easy-key-${index + 1}`,
      name,
      type: index % 7 === 0 ? "Gift card" : "Product key",
      platform: easyKeyPlatforms[index % easyKeyPlatforms.length],
      edition: index % 5 === 0 ? "Complete" : "Standard",
      delivery: index % 6 === 0 ? "Up to 15 min" : "Instant",
      activationRegion: index % 4 === 0 ? "Europe" : "Global",
      price: easyKeyPrices[index % easyKeyPrices.length],
      currency: "€",
      images: [easyKeyImages[index % easyKeyImages.length]],
    },
    seller: { ...EASY_KEY_SELLER },
  }));
}

function cloneOffer(offer: SellerOfferItem): SellerOfferItem {
  return {
    data: {
      ...offer.data,
      images: [...offer.data.images],
    },
    seller: {
      ...offer.seller,
    },
  };
}

function cloneProfile(profile: SellerProfile): SellerProfile {
  return {
    ...profile,
    offers: profile.offers.map(cloneOffer),
    reviews: profile.reviews.map((review) => ({ ...review })),
    followersList: profile.followersList.map((follower) => ({ ...follower })),
    followingList: profile.followingList.map((follower) => ({ ...follower })),
  };
}

const EASY_KEY_OFFERS_CURRENCY = "€";

function createEasyKeyProfile(): SellerProfile {
  const offers = createEasyKeyOffers();

  return {
    id: EASY_KEY_SELLER.id,
    name: EASY_KEY_SELLER.name,
    avatar: EASY_KEY_SELLER.avatar,
    banner: "/easy-key-banner.svg",
    badge: EASY_KEY_SELLER.badge,
    tier: EASY_KEY_SELLER.tier,
    rating: EASY_KEY_SELLER.rating,
    successRate: EASY_KEY_SELLER.successRate,
    totalFeedbacks: EASY_KEY_SELLER.totalFeedbacks,
    totalSales: EASY_KEY_SELLER.totalSales,
    positiveFeedbacks: EASY_KEY_SELLER.positiveFeedbacks,
    negativeFeedbacks: EASY_KEY_SELLER.negativeFeedbacks,
    timezone: EASY_KEY_SELLER.timezone,
    currency: EASY_KEY_OFFERS_CURRENCY,
    language: "EN",
    location: "BG",
    followers: 320,
    memberSince: "18 Oct 2018",
    description:
      "Working since 2018 on many platforms. We sell PC games, console games, and Gift Cards. We have a wide range of games for Playstation, Xbox, Nintendo Switch, and PC, in all popular regions, editions, and warranties. All keys you buy from us are purchased from an official distributor.",
    averagePrice: Number(
      (
        offers.reduce((sum, offer) => sum + offer.data.price, 0) /
        offers.length
      ).toFixed(2),
    ),
    offerCount: offers.length,
    offers,
    reviews: easyKeyReviews,
    followersList: easyKeyFollowers,
    followingList: [],
  };
}

const EASY_KEY_PROFILE = createEasyKeyProfile();
const EVNNPD_SELLER = {
  id: "usr_001",
  name: "evnnpd",
  avatar: "/avt1.png",
  isOnline: true,
  badge: "Seller",
  tier: "Expert",
  rating: 5,
  successRate: 100,
  totalFeedbacks: 3,
  timezone: "GMT +07:00",
  totalSales: 0,
  positiveFeedbacks: 100,
  negativeFeedbacks: 0,
};

function createEvnnpdProfile(): SellerProfile {
  const offers: SellerOfferItem[] = [
    {
      data: {
        id: "evnnpd-win11-pro",
        name: "Windows 11 Pro Key",
        type: "Software license",
        platform: "Microsoft",
        edition: "Professional",
        delivery: "Instant",
        activationRegion: "Global",
        price: 19.99,
        currency: "$",
        images: ["/product1.png"],
      },
      seller: { ...EVNNPD_SELLER },
    },
    {
      data: {
        id: "evnnpd-valorant-vp",
        name: "Valorant 11 000 VP",
        type: "Game currency",
        platform: "Riot Games",
        edition: "Global",
        delivery: "Up to 15 min",
        activationRegion: "Global",
        price: 79.9,
        currency: "$",
        images: ["/topup-valorant.jpg"],
      },
      seller: { ...EVNNPD_SELLER },
    },
  ];

  return {
    id: EVNNPD_SELLER.id,
    name: EVNNPD_SELLER.name,
    avatar: EVNNPD_SELLER.avatar,
    banner: "/cyberpunk_2077.jpg",
    badge: EVNNPD_SELLER.badge,
    tier: EVNNPD_SELLER.tier,
    rating: EVNNPD_SELLER.rating,
    successRate: EVNNPD_SELLER.successRate,
    totalFeedbacks: EVNNPD_SELLER.totalFeedbacks,
    totalSales: EVNNPD_SELLER.totalSales,
    positiveFeedbacks: EVNNPD_SELLER.positiveFeedbacks,
    negativeFeedbacks: EVNNPD_SELLER.negativeFeedbacks,
    timezone: EVNNPD_SELLER.timezone,
    currency: "$",
    language: "EN",
    location: "VN",
    followers: 0,
    memberSince: "Jun 2025",
    description:
      "Digital marketplace seller account for software keys and game top ups.",
    averagePrice: Number(
      (
        offers.reduce((sum, offer) => sum + offer.data.price, 0) /
        offers.length
      ).toFixed(2),
    ),
    offerCount: offers.length,
    offers,
    reviews: [],
    followersList: [],
    followingList: [],
  };
}

const EVNNPD_PROFILE = createEvnnpdProfile();
const STATIC_POPULAR_SELLERS: Record<string, string> = {
  gamingstore: "Gaming_store",
  justdigitalgurus: "Just_Digital_Gurus",
  fowgame: "FowGame",
  bitstore: "BitStore",
};

function createStaticPopularProfile(name: string): SellerProfile {
  const profile = cloneProfile(EASY_KEY_PROFILE);

  return {
    ...profile,
    id: normalizeSellerRouteKey(name),
    name,
  };
}

async function getAllOffers(): Promise<SellerOfferItem[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/products`,
      {
        next: { revalidate: 60 },
      },
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch offers: ${res.status}`);
    }

    const payload = await res.json();
    return payload.products || [];
  } catch (error) {
    console.error("Failed to fetch offers", error);
    return [];
  }
}

async function getSellerProfileFromBackend(
  sellerRouteKey: string,
): Promise<SellerProfile | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/sellers/${encodeURIComponent(sellerRouteKey)}`,
      {
        cache: "no-store",
      },
    );

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch seller profile: ${res.status}`);
    }

    return (await res.json()) as SellerProfile;
  } catch (error) {
    console.error("Failed to fetch seller profile", error);
    return null;
  }
}

function createDefaultReviews(sellerName: string): SellerReview[] {
  return [
    {
      id: `${sellerName}-review-1`,
      author: "marketpilot",
      avatar: "/avt1.png",
      createdAt: "2 days ago",
      rating: 5,
      sentiment: "positive",
      text: `${sellerName} delivered quickly and the activation instructions were clear.`,
    },
    {
      id: `${sellerName}-review-2`,
      author: "fastbuyer",
      avatar: "/avt.jpg",
      createdAt: "8 days ago",
      rating: 4,
      sentiment: "positive",
      text: "Support replied fast and the product worked on the first try.",
    },
    {
      id: `${sellerName}-review-3`,
      author: "keyhunter",
      avatar: "/spacex.jpg",
      createdAt: "19 days ago",
      rating: 5,
      sentiment: "positive",
      text: "Good price, reliable delivery.",
    },
  ];
}

function createDefaultFollowers(sellerId: string): SellerFollower[] {
  return easyKeyFollowers.map((follower, index) => ({
    ...follower,
    id: `${sellerId}-${follower.id}-${index}`,
    isFollowing: index === 0,
  }));
}

function createProfileFromOffer(offer: SellerOfferItem): SellerProfile {
  const profileMeta = PROFILE_META[offer.seller.id] ?? {
    memberSince: "1 Jan 2023",
    location: "Global",
    language: "EN",
    description:
      "Trusted seller with instant delivery, secure transactions, and fast support.",
  };
  const sellerMedia = SELLER_MEDIA[offer.seller.id] ?? {
    banner: "/cyberpunk_2077.jpg",
    avatar: offer.seller.avatar || "/avt.jpg",
  };

  return {
    id: offer.seller.id,
    name: offer.seller.name,
    avatar: offer.seller.avatar || sellerMedia.avatar,
    banner: sellerMedia.banner,
    badge: offer.seller.badge || "Seller",
    tier: offer.seller.tier,
    rating: offer.seller.rating,
    successRate: offer.seller.successRate,
    totalFeedbacks: offer.seller.totalFeedbacks,
    totalSales: offer.seller.totalSales,
    positiveFeedbacks: offer.seller.positiveFeedbacks,
    negativeFeedbacks: offer.seller.negativeFeedbacks,
    timezone: offer.seller.timezone,
    currency: offer.data.currency,
    language: profileMeta.language,
    location: profileMeta.location,
    followers: Math.max(100, Math.round(offer.seller.totalFeedbacks * 1.5)),
    memberSince: profileMeta.memberSince,
    description: profileMeta.description,
    averagePrice: Number(offer.data.price.toFixed(2)),
    offerCount: 1,
    offers: [offer],
    reviews: createDefaultReviews(offer.seller.name),
    followersList: createDefaultFollowers(offer.seller.id),
    followingList: [],
  };
}

export async function getSellerProfile(
  sellerRouteKey: string,
): Promise<SellerProfile | null> {
  const normalizedRouteKey = normalizeSellerRouteKey(sellerRouteKey);

  if (
    normalizedRouteKey === "easy-key" ||
    normalizedRouteKey === "easykey" ||
    normalizedRouteKey === "default"
  ) {
    return cloneProfile(EASY_KEY_PROFILE);
  }

  if (normalizedRouteKey === "evnnpd" || normalizedRouteKey === "usr001") {
    return cloneProfile(EVNNPD_PROFILE);
  }

  const staticPopularSeller = STATIC_POPULAR_SELLERS[normalizedRouteKey];
  if (staticPopularSeller) {
    return createStaticPopularProfile(staticPopularSeller);
  }

  try {
    // 1. Fetch user details from public.users table by matching display_name (case-insensitive)
    const profileQuery = supabase
      .from("users")
      .select("id, display_name, avatar_url, rating, is_verified_seller, created_at, updated_at");
    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sellerRouteKey);
    const { data: userData, error: userError } = await (isId ? profileQuery.eq("id", sellerRouteKey) : profileQuery.ilike("display_name", sellerRouteKey.replace(/-/g, " "))).maybeSingle();

    if (userError || !userData) {
      console.log(`Seller ${sellerRouteKey} not found in public.users, falling back to static offers filtering.`);
    } else {
      // 2. Fetch all published products for this seller
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", userData.id)
        .eq("status", "published");

      if (productsError) {
        console.error(`Error fetching products for seller ${sellerRouteKey}:`, productsError);
      }

      const rating = Number(userData.rating ?? 0);
      const sellerProducts = productsData || [];
      
      const offers: SellerOfferItem[] = sellerProducts.map((p): SellerOfferItem => ({
        data: {
          id: p.id,
          name: p.title,
          type: p.category || "Games",
          platform: p.platform || "PC",
          edition: p.edition || "Standard",
          delivery: p.delivery || "Instant",
          activationRegion: p.region || "Global",
          price: Number(p.price),
          currency: p.currency || "$",
          images: [p.image_url],
        },
        seller: {
          id: userData.id,
          name: userData.display_name,
          avatar: userData.avatar_url || "/avt1.png",
          isOnline: false,
          badge: userData.is_verified_seller ? "Verified Seller" : "Seller",
          tier: rating >= 4.9 ? "Legendary" : rating >= 4.8 ? "Elite" : "Pro",
          rating: rating,
          successRate: 0,
          totalFeedbacks: 0,
          timezone: "GMT +07:00",
          totalSales: sellerProducts.reduce((sum, product) => sum + Number(product.sales ?? 0), 0),
          positiveFeedbacks: 0,
          negativeFeedbacks: 0,
        }
      }));

      const profile: SellerProfile = {
        id: userData.id,
        name: userData.display_name,
        avatar: userData.avatar_url || "/avt1.png",
        banner: "/easy-key-banner.svg",
        badge: userData.is_verified_seller ? "Verified Seller" : "Seller",
        tier: rating >= 4.9 ? "Legendary" : rating >= 4.8 ? "Elite" : "Pro",
        rating: rating,
        successRate: 0,
        totalFeedbacks: 0,
        totalSales: sellerProducts.reduce((sum, product) => sum + Number(product.sales ?? 0), 0),
        positiveFeedbacks: 0,
        negativeFeedbacks: 0,
        timezone: "GMT +07:00",
        currency: "$",
        language: "English, Vietnamese",
        location: "Vietnam",
        followers: 0,
        memberSince: new Date(userData.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        description: "Game seller on Difmark.",
        offerCount: sellerProducts.length,
        averagePrice: sellerProducts.length > 0 ? Number((sellerProducts.reduce((sum, p) => sum + Number(p.price), 0) / sellerProducts.length).toFixed(2)) : 0,
        offers: offers,
        reviews: [],
        followersList: [],
        followingList: [],
      };
      return (await withStoredSellerActivity([profile]))[0];
    }
  } catch (e) {
    console.error(`Error querying Supabase for seller profile ${sellerRouteKey}:`, e);
  }

  // Fallback to offline/static parsing
  const backendProfile = await getSellerProfileFromBackend(sellerRouteKey);
  if (backendProfile) {
    return backendProfile;
  }

  return null;
}

export async function getTrustedSellers(): Promise<SellerProfile[]> {
  try {
    // 1. Fetch all verified sellers from Supabase
    const { data: dbSellers, error: sellersError } = await supabase
      .from("users")
      .select("id, display_name, avatar_url, rating, is_verified_seller, created_at, updated_at")
      ;

    if (sellersError || !dbSellers) {
      console.error("Error fetching trusted sellers from Supabase:", sellersError);
    } else {
      // 2. Fetch all published products
      const { data: dbProducts, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("status", "published");

      if (productsError) {
        console.error("Error fetching products for trusted sellers:", productsError);
      }

      const profiles: SellerProfile[] = [];

      // 3. Construct profiles
      for (const u of dbSellers) {
        const sellerProducts = (dbProducts || []).filter(p => p.seller_id === u.id);
        if (!sellerProducts.length) continue;
        
        const offers: SellerOfferItem[] = sellerProducts.map((p): SellerOfferItem => ({
          data: {
            id: p.id,
            name: p.title,
            type: p.category || "Games",
            platform: p.platform || "PC",
            edition: p.edition || "Standard",
            delivery: p.delivery || "Instant",
            activationRegion: p.region || "Global",
            price: Number(p.price),
            currency: p.currency || "$",
            images: [p.image_url],
          },
          seller: {
            id: u.id,
            name: u.display_name,
            avatar: u.avatar_url || "/avt1.png",
            isOnline: false,
            badge: u.is_verified_seller ? "Verified Seller" : "Seller",
            tier: u.rating >= 4.9 ? "Legendary" : u.rating >= 4.8 ? "Elite" : "Pro",
            rating: Number(u.rating ?? 0),
            successRate: 0,
            totalFeedbacks: 0,
            timezone: "GMT +07:00",
            totalSales: sellerProducts.reduce((sum, product) => sum + Number(product.sales ?? 0), 0),
            positiveFeedbacks: 0,
            negativeFeedbacks: 0,
          }
        }));

        const rating = Number(u.rating ?? 0);
        const profile: SellerProfile = {
          id: u.id,
          name: u.display_name,
          avatar: u.avatar_url || "/avt1.png",
          banner: "/easy-key-banner.svg",
          badge: u.is_verified_seller ? "Verified Seller" : "Seller",
          tier: rating >= 4.9 ? "Legendary" : rating >= 4.8 ? "Elite" : "Pro",
          rating: rating,
          successRate: 0,
          totalFeedbacks: 0,
          totalSales: sellerProducts.reduce((sum, product) => sum + Number(product.sales ?? 0), 0),
          positiveFeedbacks: 0,
          negativeFeedbacks: 0,
          timezone: "GMT +07:00",
          currency: "$",
          language: "English, Vietnamese",
          location: "Vietnam",
          followers: 0,
          memberSince: new Date(u.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          description: "Game seller on Difmark.",
          offerCount: sellerProducts.length,
          averagePrice: sellerProducts.length > 0 ? Number((sellerProducts.reduce((sum, p) => sum + Number(p.price), 0) / sellerProducts.length).toFixed(2)) : 0,
          offers: offers,
          reviews: [],
          followersList: [],
          followingList: [],
        };

        profiles.push(profile);
      }

      // Rank the directory by published offer count, as on the homepage.
      profiles.sort((a, b) => b.offerCount - a.offerCount || a.id.localeCompare(b.id));

      return withStoredSellerActivity(profiles);
    }
  } catch (error) {
    console.error("Failed to get trusted sellers dynamically:", error);
  }

  // Fallback to static list
  return [];
}
