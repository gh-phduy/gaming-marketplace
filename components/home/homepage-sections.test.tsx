import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GamesSection from "@/components/shared/GamesSection";
import UpcomingGamesSection from "./UpcomingGamesSection";
import messages from "@/messages/en.json";
import { getHomepageProducts } from "@/lib/homepage-products";

const catalog = vi.hoisted(() => ({ rows: [] as Record<string, any>[], error: null as { message: string } | null }));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => {
      let rows = [...catalog.rows];
      const query = {
        select: () => query,
        eq: (column: string, value: unknown) => {
          rows = rows.filter(row => row[column] === value);
          return query;
        },
        lt: (column: string, value: number) => {
          rows = rows.filter(row => row[column] != null && Number(row[column]) < value);
          return query;
        },
        order: () => query,
        limit: (count: number) => { rows = rows.slice(0, count); return query; },
        returns: () => query,
        then: (resolve: (result: unknown) => unknown) =>
          Promise.resolve({ data: rows, error: catalog.error }).then(resolve),
      };
      return query;
    },
  }),
}));

vi.mock("@/components/shared/GameCard", () => ({
  default: ({ title, sellerName }: { title: string; sellerName: string }) => <article>{title} | {sellerName}</article>,
}));
vi.mock("./UpcomingGameCard", () => ({
  default: ({ title, releaseDate }: { title: string; releaseDate?: string }) => <article>{title}{releaseDate && <span>{releaseDate}</span>}</article>,
}));
vi.mock("@/components/product/ProductCarousel", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/shared/SectionHeader", () => ({
  default: ({ headingText }: { headingText: string }) => <h2>{headingText}</h2>,
}));

function product(title: string, extras: Record<string, unknown> = {}) {
  return {
    id: title, title, status: "published", price: 29.99, currency: "USD",
    image_url: "https://example.test/any-folder/cover.jpg",
    is_new: false, is_weekly: false, is_under_price: false, is_upcoming: false,
    release_date: null,
    seller: { display_name: "Demo Game Store", rating: 0 },
    ...extras,
  };
}

function renderLocalized(children: ReactNode) {
  return render(<NextIntlClientProvider locale="en" messages={messages} timeZone="UTC">{children}</NextIntlClientProvider>);
}

describe("homepage catalog sections", () => {
  beforeEach(() => {
    catalog.rows = [];
    catalog.error = null;
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-public-key");
  });
  afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

  it.each([["new", "is_new"], ["weekly", "is_weekly"]] as const)(
    "%s uses its section flag even when the image lives in another folder", async (sectionType, flag) => {
      catalog.rows = [
        product("Selected game", { [flag]: true }),
        product("Unselected game"),
        product("Draft game", { [flag]: true, status: "draft" }),
      ];
      const products = await getHomepageProducts();
      renderLocalized(<GamesSection title="Games" sectionType={sectionType} games={products[sectionType]} />);
      await waitFor(() => expect(screen.getAllByText("Selected game | Demo Game Store")).toHaveLength(2));
      expect(screen.queryByText(/Unselected game|Draft game/)).not.toBeInTheDocument();
    },
  );

  it("Under $100 requires its flag, a USD price below 100, and published status", async () => {
    catalog.rows = [
      product("Budget game", { is_under_price: true, price: 99.99 }),
      product("At threshold", { is_under_price: true, price: 100 }),
      product("Euro game", { is_under_price: true, price: 80, currency: "EUR" }),
      product("No price", { is_under_price: true, price: null }),
      product("Not selected", { price: 1 }),
      product("Budget draft", { is_under_price: true, price: 1, status: "draft" }),
    ];
    const products = await getHomepageProducts();
    renderLocalized(<GamesSection title="Under $100" sectionType="under" games={products.under} />);
    await waitFor(() => expect(screen.getAllByText("Budget game | Demo Game Store")).toHaveLength(2));
    expect(screen.queryByText(/At threshold|Euro game|No price|Not selected|Budget draft/)).not.toBeInTheDocument();
  });

  it("Upcoming uses its flag and formats only known release dates", async () => {
    catalog.rows = [
      product("Dated game", { is_upcoming: true, release_date: "2027-01-02" }),
      product("Undated game", { is_upcoming: true }),
      product("Upcoming draft", { is_upcoming: true, status: "draft" }),
      product("Wrong section"),
    ];
    const products = await getHomepageProducts();
    renderLocalized(<UpcomingGamesSection games={products.upcoming} />);
    await waitFor(() => expect(screen.getAllByText("Undated game")).toHaveLength(2));
    expect(screen.getAllByText("Jan 2, 2027")).toHaveLength(2);
    expect(screen.queryByText(/Upcoming draft|Wrong section|28 Aug 2026|undefined/)).not.toBeInTheDocument();
  });

  it("includes product cards in the initial server HTML without browser fetching", async () => {
    catalog.rows = [product("Server-rendered game", { is_new: true })];
    const products = await getHomepageProducts();
    const html = renderToString(
      <NextIntlClientProvider locale="en" messages={messages} timeZone="UTC">
        <GamesSection title="New" sectionType="new" games={products.new} />
      </NextIntlClientProvider>,
    );
    expect(html).toContain("Server-rendered game");
    expect(html).toContain("Demo Game Store");
  });

  it("reports a catalog failure instead of silently returning an empty section", async () => {
    catalog.error = { message: "Database is unavailable" };
    await expect(getHomepageProducts()).rejects.toThrow("Database is unavailable");
  });
});
