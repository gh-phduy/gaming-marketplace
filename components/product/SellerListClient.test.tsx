import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import messages from "@/messages/en.json";
import SellerListClient from "./SellerListClient";
import type { SellerOffer } from "./SellerRow";

vi.mock("./SellerRow", () => ({
  default: ({ offer }: { offer: SellerOffer }) => (
    <article>{offer.seller.name}</article>
  ),
}));
afterEach(cleanup);

function offer(
  name: string,
  price: number,
  platform: string,
  region: string,
  rating = 0,
): SellerOffer {
  return {
    data: {
      id: name,
      title: "Marathon",
      type: "Product key",
      platform,
      edition: "Standard",
      activationRegion: region,
      price,
      currency: "USD",
      image_url: "/cover.jpg",
    },
    seller: {
      id: name,
      name,
      avatar: "/avatar.jpg",
      isOnline: false,
      tier: "Seller",
      rating,
    },
  };
}
function mount(offers: SellerOffer[]) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SellerListClient initialOffers={offers} />
    </NextIntlClientProvider>,
  );
}
const rows = () =>
  screen.queryAllByRole("article").map((row) => row.textContent);

describe("seller offer filters", () => {
  it("offers individual platform choices and matches any tag on the same offer", () => {
    mount([
      offer("Multi", 15, "PC, PS5, Xbox Series X/S", "Global"),
      offer("Switch", 20, "Nintendo Switch", "Global"),
    ]);
    const select = screen.getByRole("combobox", {
      name: messages.product.allPlatforms,
    });
    expect(
      [...select.querySelectorAll("option")].map((option) => option.value),
    ).toEqual(["all", "Nintendo Switch", "PC", "PS5", "Xbox Series X/S"]);
    for (const value of ["PC", "PS5", "Xbox Series X/S"]) {
      fireEvent.change(select, { target: { value } });
      expect(rows()).toEqual(["Multi"]);
    }
    fireEvent.change(select, { target: { value: "Nintendo Switch" } });
    expect(rows()).toEqual(["Switch"]);
  });
  it("combines filters, sorts visible offers, and restores defaults on reset", () => {
    mount([
      offer("Local", 10, "PC", "Europe", 5),
      offer("Xbox", 30, "Xbox", "Global", 3),
      offer("PC", 20, "PC", "Global", 4),
    ]);
    expect(rows()).toEqual(["Local", "PC", "Xbox"]);
    fireEvent.change(
      screen.getByRole("combobox", { name: messages.product.allRegions }),
      { target: { value: "Global" } },
    );
    fireEvent.change(
      screen.getByRole("combobox", { name: messages.product.price }),
      { target: { value: "price_desc" } },
    );
    expect(rows()).toEqual(["Xbox", "PC"]);
    fireEvent.change(
      screen.getByRole("combobox", { name: messages.product.allPlatforms }),
      { target: { value: "PC" } },
    );
    expect(rows()).toEqual(["PC"]);
    fireEvent.click(
      screen.getByRole("button", { name: "Reset offer filters" }),
    );
    expect(rows()).toEqual(["Local", "PC", "Xbox"]);
    expect(
      screen.getByRole("combobox", { name: messages.product.allRegions }),
    ).toHaveValue("all");
    fireEvent.change(
      screen.getByRole("combobox", { name: messages.product.price }),
      { target: { value: "rating" } },
    );
    expect(rows()).toEqual(["Local", "PC", "Xbox"]);
  });

  it("shows the empty state when combined filters have no matches", () => {
    mount([
      offer("Local", 10, "PC", "Europe"),
      offer("Xbox", 30, "Xbox", "Global"),
    ]);
    fireEvent.change(
      screen.getByRole("combobox", { name: messages.product.allRegions }),
      { target: { value: "Europe" } },
    );
    fireEvent.change(
      screen.getByRole("combobox", { name: messages.product.allPlatforms }),
      { target: { value: "Xbox" } },
    );
    expect(rows()).toHaveLength(0);
    expect(screen.getByText(messages.product.noSellers)).toBeInTheDocument();
  });
});
