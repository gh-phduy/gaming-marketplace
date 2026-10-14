import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GamesSection from "@/components/shared/GamesSection";
import UpcomingGamesSection from "./UpcomingGamesSection";
import PopularGamesSection from "./PopularGamesSection";
import messages from "@/messages/en.json";
import { getHomepageProducts } from "@/lib/homepage-products";

const catalog = vi.hoisted(() => ({
  rows: [] as Record<string, any>[],
  error: null as { message: string } | null,
}));
const cart = vi.hoisted(() => ({ addToCart: vi.fn() }));
vi.mock("@/contexts/CartContext", () => ({ useCart: () => cart }));
vi.mock("next/cache", () => ({
  unstable_cache: (load: () => unknown) => load,
}));
vi.mock("next-intl/server", async () => {
  const { createTranslator, createFormatter } = await import("next-intl");
  return {
    getTranslations: async () =>
      createTranslator({ locale: "en", messages, namespace: "home" }),
    getFormatter: async () =>
      createFormatter({ locale: "en", timeZone: "UTC" }),
  };
});

vi.mock("embla-carousel-react", () => ({
  default: () => [undefined, undefined],
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => {
      let rows = [...catalog.rows];
      const query = {
        select: () => query,
        eq: (column: string, value: unknown) => {
          rows = rows.filter((row) => row[column] === value);
          return query;
        },
        lt: (column: string, value: number) => {
          rows = rows.filter(
            (row) => row[column] != null && Number(row[column]) < value,
          );
          return query;
        },
        order: () => query,
        limit: (count: number) => {
          rows = rows.slice(0, count);
          return query;
        },
        returns: () => query,
        then: (resolve: (result: unknown) => unknown) =>
          Promise.resolve({ data: rows, error: catalog.error }).then(resolve),
      };
      return query;
    },
  }),
}));

vi.mock("@/components/shared/GameCard", () => ({
  default: ({
    title,
    sellerName,
    onAddToCart,
  }: {
    title: string;
    sellerName: string;
    onAddToCart?: () => void;
  }) => (
    <article>
      {title} | {sellerName}
      <button onClick={onAddToCart}>Add {title} to cart</button>
    </article>
  ),
}));
vi.mock("./UpcomingGameCard", () => ({
  default: ({
    title,
    releaseDate,
    onAddToCart,
  }: {
    title: string;
    releaseDate?: string;
    onAddToCart?: () => void;
  }) => (
    <article>
      {title}
      {releaseDate && <span>{releaseDate}</span>}
      <button onClick={onAddToCart}>Add {title} to cart</button>
    </article>
  ),
}));
vi.mock("./PopularGameCard", () => ({
  default: ({
    title,
    onAddToCart,
  }: {
    title: string;
    onAddToCart?: () => void;
  }) => (
    <article>
      {title}
      <button onClick={onAddToCart}>Add {title} to cart</button>
    </article>
  ),
}));
vi.mock("@/components/product/ProductCarousel", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/shared/SectionHeader", () => ({
  default: ({ headingText }: { headingText: string }) => <h2>{headingText}</h2>,
}));

function product(title: string, extras: Record<string, unknown> = {}) {
  return {
    id: title,
    title,
    status: "published",
    price: 29.99,
    currency: "USD",
    image_url: "https://example.test/any-folder/cover.jpg",
    is_new: false,
    is_weekly: false,
    is_under_price: false,
    is_upcoming: false,
    release_date: null,
    seller: { display_name: "Demo Game Store", rating: 0 },
    ...extras,
  };
}

function renderLocalized(children: ReactNode) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages} timeZone="UTC">
      {children}
    </NextIntlClientProvider>,
  );
}

describe("homepage catalog sections", () => {
  beforeEach(() => {
    catalog.rows = [];
    catalog.error = null;
    cart.addToCart.mockClear();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-public-key");
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
  });

  it.each([
    ["new", "is_new"],
    ["weekly", "is_weekly"],
  ] as const)(
    "%s uses its section flag even when the image lives in another folder",
    async (sectionType, flag) => {
      catalog.rows = [
        product("Selected game", { [flag]: true }),
        product("Unselected game"),
        product("Draft game", { [flag]: true, status: "draft" }),
      ];
      const products = await getHomepageProducts();
      renderLocalized(
        await GamesSection({
          title: "Games",
          sectionType,
          games: products[sectionType],
        }),
      );
      await waitFor(() =>
        expect(
          screen.getAllByText("Selected game | Demo Game Store"),
        ).toHaveLength(1),
      );
      expect(
        screen.queryByText(/Unselected game|Draft game/),
      ).not.toBeInTheDocument();
    },
  );

  it("Under $100 requires its flag, a USD price below 100, and published status", async () => {
    catalog.rows = [
      product("Budget game", { is_under_price: true, price: 99.99 }),
      product("At threshold", { is_under_price: true, price: 100 }),
      product("Euro game", {
        is_under_price: true,
        price: 80,
        currency: "EUR",
      }),
      product("No price", { is_under_price: true, price: null }),
      product("Not selected", { price: 1 }),
      product("Budget draft", {
        is_under_price: true,
        price: 1,
        status: "draft",
      }),
    ];
    const products = await getHomepageProducts();
    renderLocalized(
      await GamesSection({
        title: "Under $100",
        sectionType: "under",
        games: products.under,
      }),
    );
    await waitFor(() =>
      expect(screen.getAllByText("Budget game | Demo Game Store")).toHaveLength(
        1,
      ),
    );
    expect(
      screen.queryByText(
        /At threshold|Euro game|No price|Not selected|Budget draft/,
      ),
    ).not.toBeInTheDocument();
  });

  it("Upcoming uses its flag and formats only known release dates", async () => {
    catalog.rows = [
      product("Dated game", { is_upcoming: true, release_date: "2027-01-02" }),
      product("Undated game", { is_upcoming: true }),
      product("Upcoming draft", { is_upcoming: true, status: "draft" }),
      product("Wrong section"),
    ];
    const products = await getHomepageProducts();
    renderLocalized(await UpcomingGamesSection({ games: products.upcoming }));
    await waitFor(() =>
      expect(screen.getAllByText("Undated game")).toHaveLength(1),
    );
    expect(screen.getAllByText("Jan 2, 2027")).toHaveLength(1);
    expect(
      screen.queryByText(/Upcoming draft|Wrong section|28 Aug 2026|undefined/),
    ).not.toBeInTheDocument();
  });

  it("includes product cards in the initial server HTML without browser fetching", async () => {
    catalog.rows = [product("Server-rendered game", { is_new: true })];
    const products = await getHomepageProducts();
    const section = await GamesSection({
      title: "New",
      sectionType: "new",
      games: products.new,
    });
    const html = renderToString(
      <NextIntlClientProvider locale="en" messages={messages} timeZone="UTC">
        {section}
      </NextIntlClientProvider>,
    );
    expect(html).toContain("Server-rendered game");
    expect(html).toContain("Demo Game Store");
  });

  it("shows reference mock dates for known upcoming games but prioritizes catalog dates", async () => {
    catalog.rows = [
      product("Grand Theft Auto VI", { is_upcoming: true }),
      product("Fable Xbox Series", {
        is_upcoming: true,
        release_date: "2027-04-05",
      }),
    ];
    const products = await getHomepageProducts();
    renderLocalized(await UpcomingGamesSection({ games: products.upcoming }));
    expect(screen.getByText("Nov 19, 2026")).toBeInTheDocument();
    expect(screen.getByText("Apr 5, 2027")).toBeInTheDocument();
    expect(screen.queryByText("Feb 23, 2027")).not.toBeInTheDocument();
  });

  it("reports a catalog failure instead of silently returning an empty section", async () => {
    catalog.error = { message: "Database is unavailable" };
    await expect(getHomepageProducts()).rejects.toThrow(
      "Database is unavailable",
    );
  });

  it.each([
    PopularGamesSection,
    UpcomingGamesSection,
    ({ games }: { games: Parameters<typeof GamesSection>[0]["games"] }) =>
      GamesSection({ title: "New", sectionType: "new", games }),
    ({ games }: { games: Parameters<typeof GamesSection>[0]["games"] }) =>
      GamesSection({ title: "Weekly", sectionType: "weekly", games }),
    ({ games }: { games: Parameters<typeof GamesSection>[0]["games"] }) =>
      GamesSection({ title: "Under $100", sectionType: "under", games }),
  ])(
    "%s adds the catalog game with its numeric price and currency",
    async (Section) => {
      const game = {
        id: "game-1",
        title: "Test game",
        price: 37.5,
        currency: "EUR",
        image_url: "https://example.test/cover.jpg",
        video_url: null,
        platform: "pc",
        release_date: null,
        seller: null,
      };
      renderLocalized(await Section({ games: [game] }));
      screen.getByRole("button", { name: "Add Test game to cart" }).click();
      expect(cart.addToCart).toHaveBeenCalledExactlyOnceWith({
        id: "game-1",
        name: "Test game",
        price: 37.5,
        currency: "EUR",
        image: "https://example.test/cover.jpg",
        platform: "pc",
      });
    },
  );
});
