import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

async function chooseFilter(label: string, option: string) {
  await userEvent.click(screen.getByRole("combobox", { name: label }));
  await userEvent.click(
    within(await screen.findByRole("listbox")).getByRole("option", {
      name: option,
    }),
  );
  await waitFor(() =>
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
  );
}

describe("seller offer filters", () => {
  it("offers individual platform choices and matches any tag on the same offer", async () => {
    mount([
      offer("Multi", 15, "PC, PS5, Xbox Series X/S", "Global"),
      offer("Switch", 20, "Nintendo Switch", "Global"),
    ]);
    const select = screen.getByRole("combobox", {
      name: messages.product.allPlatforms,
    });
    await userEvent.click(select);
    const options = within(await screen.findByRole("listbox")).getAllByRole(
      "option",
    );
    expect(options.map((option) => option.textContent)).toEqual([
      messages.product.allPlatforms,
      "Nintendo Switch",
      "PC",
      "PS5",
      "Xbox Series X/S",
    ]);
    await userEvent.keyboard("{Escape}");
    for (const value of ["PC", "PS5", "Xbox Series X/S"]) {
      await chooseFilter(messages.product.allPlatforms, value);
      expect(rows()).toEqual(["Multi"]);
    }
    await chooseFilter(messages.product.allPlatforms, "Nintendo Switch");
    expect(rows()).toEqual(["Switch"]);
  });
  it("combines filters, sorts visible offers, and restores defaults on reset", async () => {
    mount([
      offer("Local", 10, "PC", "Europe", 5),
      offer("Xbox", 30, "Xbox", "Global", 3),
      offer("PC", 20, "PC", "Global", 4),
    ]);
    expect(rows()).toEqual(["Local", "PC", "Xbox"]);
    await chooseFilter(messages.product.allRegions, "Global");
    await chooseFilter(messages.product.price, messages.product.priceHighToLow);
    expect(rows()).toEqual(["Xbox", "PC"]);
    await chooseFilter(messages.product.allPlatforms, "PC");
    expect(rows()).toEqual(["PC"]);
    await userEvent.click(
      screen.getByRole("button", { name: "Reset offer filters" }),
    );
    expect(rows()).toEqual(["Local", "PC", "Xbox"]);
    expect(
      screen.getByRole("combobox", { name: messages.product.allRegions }),
    ).toHaveTextContent(messages.product.allRegions);
    await chooseFilter(messages.product.price, messages.product.sellerRating);
    expect(rows()).toEqual(["Local", "PC", "Xbox"]);
  });

  it("shows the empty state when combined filters have no matches", async () => {
    mount([
      offer("Local", 10, "PC", "Europe"),
      offer("Xbox", 30, "Xbox", "Global"),
    ]);
    await chooseFilter(messages.product.allRegions, "Europe");
    await chooseFilter(messages.product.allPlatforms, "Xbox");
    expect(rows()).toHaveLength(0);
    expect(screen.getByText(messages.product.noSellers)).toBeInTheDocument();
  });

  it("supports keyboard selection and closes with Escape without changing the filter", async () => {
    mount([
      offer("Local", 10, "PC", "Europe"),
      offer("Global", 20, "PC", "Global"),
    ]);
    const trigger = screen.getByRole("combobox", {
      name: messages.product.allRegions,
    });
    trigger.focus();
    await userEvent.keyboard("{Enter}{ArrowDown}{Enter}");
    expect(trigger).toHaveTextContent("Europe");
    expect(rows()).toEqual(["Local"]);
    await userEvent.click(trigger);
    expect(
      await screen.findByRole("option", { name: "Europe", selected: true }),
    ).toBeInTheDocument();
    await userEvent.keyboard("{ArrowDown}{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(rows()).toEqual(["Local"]);
  });
});
