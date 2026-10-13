import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import TrustedSellersClient from "./TrustedSellersClient";
import type { DirectorySeller } from "@/lib/seller-directory";
vi.mock("next-intl", () => ({ useLocale: () => "en" }));
vi.mock("next/image", () => ({
  default: ({ fill, ...props }: Record<string, unknown>) => <img {...props} />,
}));
vi.mock("@/i18n/routing", () => ({
  Link: ({
    children,
    prefetch,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <a {...props}>{children}</a>
  ),
}));
const sellers: DirectorySeller[] = Array.from({ length: 25 }, (_, i) => ({
  id: `seller-${i}`,
  name: `Store ${String(i).padStart(2, "0")}`,
  avatar: "/avt.jpg",
  rating: 4.5 + i / 100,
  reviews: 100 + i,
  sales: 1000 + i,
  tier: "Expert",
  location: "Vietnam",
  verified: false,
  categories: [i % 2 ? "Games" : "Gift cards"],
  sampleStats: true,
}));
function directoryLinks() {
  return screen.getAllByRole("link").filter((link) => !link.closest("section"));
}
describe("seller directory interactions", () => {
  it("filters by name and category, resets filters and shows an empty state", () => {
    render(<TrustedSellersClient sellers={sellers} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Store 01" },
    });
    expect(directoryLinks()).toHaveLength(1);
    expect(directoryLinks()[0]).toHaveAttribute("href", "/user/seller-1");
    fireEvent.change(screen.getByRole("combobox", { name: "All categories" }), {
      target: { value: "Gift cards" },
    });
    expect(screen.getByText("No sellers found")).toBeInTheDocument();
    fireEvent.click(
      screen.getAllByRole("button", { name: "Reset filters" })[0],
    );
    expect(directoryLinks()).toHaveLength(12);
  });
  it("sorts, loads more and moves between pages without retaining expanded rows", () => {
    render(<TrustedSellersClient sellers={sellers} />);
    fireEvent.change(screen.getByRole("combobox", { name: "Most popular" }), {
      target: { value: "name" },
    });
    expect(directoryLinks()[0]).toHaveTextContent("Store 00");
    fireEvent.click(screen.getByRole("button", { name: "Show more" }));
    expect(directoryLinks()).toHaveLength(24);
    fireEvent.click(
      within(screen.getByRole("navigation", { name: "Pagination" })).getByRole(
        "button",
        { name: "Next" },
      ),
    );
    expect(directoryLinks()).toHaveLength(12);
    expect(directoryLinks()[0]).toHaveTextContent("Store 12");
    fireEvent.change(
      screen.getByRole("combobox", { name: "Sellers per page" }),
      { target: { value: "24" } },
    );
    expect(directoryLinks()).toHaveLength(24);
    expect(directoryLinks()[0]).toHaveTextContent("Store 00");
  });
  it("advances and collapses the recommended sellers", () => {
    render(<TrustedSellersClient sellers={sellers} />);
    const section = screen.getByRole("region", { name: "Recommended sellers" });
    const first = within(section).getAllByRole("link")[0].textContent;
    fireEvent.click(screen.getByRole("button", { name: "Next sellers" }));
    expect(within(section).getAllByRole("link")[0].textContent).not.toBe(first);
    fireEvent.click(
      screen.getByRole("button", { name: "Toggle recommended sellers" }),
    );
    expect(within(section).queryAllByRole("link")).toHaveLength(0);
  });
});
