import { renderToString } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NavBar from "./NavBar";
import { CartProvider } from "@/contexts/CartContext";
import { CheckoutPaymentStatusProvider } from "@/components/checkout/CheckoutPaymentStatus";
import messages from "@/messages/en.json";

const route = vi.hoisted(() => ({ path: "/" }));
vi.mock("@/i18n/routing", () => ({
  usePathname: () => route.path,
  Link: ({ prefetch, ...props }: any) => <a {...props} />,
}));
vi.mock("next/navigation", () => ({
  usePathname: () => `/en${route.path}`,
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("next/image", () => ({
  default: ({ fill, ...props }: any) => <img {...props} />,
}));
// Keep every optional chunk unresolved: the visible navbar must still exist.
vi.mock("next/dynamic", () => ({
  default: (_loader: unknown, options?: { loading?: any }) =>
    options?.loading ?? (() => null),
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: null, isLoading: true }),
}));

function serverNavbar() {
  return renderToString(
    <NextIntlClientProvider locale="en" messages={messages} timeZone="UTC">
      <CartProvider>
        <CheckoutPaymentStatusProvider>
          <NavBar />
        </CheckoutPaymentStatusProvider>
      </CartProvider>
    </NextIntlClientProvider>,
  );
}

beforeEach(() => {
  route.path = "/";
});

describe("navbar before hydration", () => {
  it("includes search, categories, cart and account slots before auth or optional chunks load", () => {
    const html = serverNavbar();
    const document = new DOMParser().parseFromString(html, "text/html");
    expect(
      document.querySelector('input[aria-label="Search products"]'),
    ).not.toBeNull();
    expect(html).toContain("All Categories");
    expect(html).toContain(`aria-label="${messages.cart.shoppingCartAria}"`);
    expect(html).toContain(`aria-label="${messages.nav.notificationsTitle}"`);
    expect(html).toContain(`aria-label="${messages.nav.messages}"`);
    expect(
      document.querySelector('[role="status"][aria-busy="true"]'),
    ).not.toBeNull();
  });

  it("includes checkout progress in server HTML instead of an empty fallback", () => {
    route.path = "/checkout";
    const html = serverNavbar();
    expect(html).toContain("Checkout navigation");
    expect(html).toContain("Shopping Cart");
    expect(html).toContain("Processing");
    expect(html).not.toContain('aria-label="Search products"');
  });
});
