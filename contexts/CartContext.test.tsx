import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import { CartProvider, useCart } from "./CartContext";
import en from "@/messages/en.json";
import vn from "@/messages/vi.json";

const game = {
  id: "demo",
  name: "Test game",
  platform: "pc",
  image: "/cover.jpg",
  price: 25.99,
  currency: "USD",
};

function CartActions() {
  const { addToCart, cartCount, incrementItem, decrementItem, removeItem } =
    useCart();
  return (
    <>
      <button onClick={() => addToCart(game)}>Add game</button>
      <button
        onClick={() => addToCart({ ...game, id: "other", name: "Other game" })}
      >
        Add other
      </button>
      <button onClick={() => incrementItem(game.id)}>Increase quantity</button>
      <button onClick={() => decrementItem(game.id)}>Decrease quantity</button>
      <button onClick={() => removeItem(game.id)}>Remove game</button>
      <button onClick={() => removeItem("missing")}>Remove missing game</button>
      <p aria-label="Cart quantity">{cartCount}</p>
    </>
  );
}

function renderCart(locale = "en") {
  return render(
    <NextIntlClientProvider
      locale={locale}
      messages={locale === "vi" ? vn : en}
      timeZone="UTC"
    >
      <CartProvider>
        <CartActions />
      </CartProvider>
    </NextIntlClientProvider>,
  );
}

describe("cart notifications", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    localStorage.clear();
  });

  it("shows the added game and persists the updated cart", () => {
    renderCart();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    fireEvent.click(screen.getByRole("button", { name: "Add game" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Product added to cart",
    );
    expect(screen.getByRole("status")).toHaveTextContent(game.name);
    expect(screen.getByLabelText("Cart quantity")).toHaveTextContent("1");
    expect(JSON.parse(localStorage.getItem("cart_items")!)).toEqual([
      { ...game, quantity: 1 },
    ]);
  });

  it("restarts the timeout when the same game is added again without stacking notices", () => {
    renderCart();
    fireEvent.click(screen.getByRole("button", { name: "Add game" }));
    act(() => vi.advanceTimersByTime(3000));
    fireEvent.click(screen.getByRole("button", { name: "Add game" }));
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getAllByText("Product added to cart")).toHaveLength(1);
    expect(screen.getByLabelText("Cart quantity")).toHaveTextContent("2");
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("replaces the previous game name and supports dismissing the notice", () => {
    renderCart();
    fireEvent.click(screen.getByRole("button", { name: "Add game" }));
    fireEvent.click(screen.getByRole("button", { name: "Add other" }));
    expect(screen.getByRole("status")).toHaveTextContent("Other game");
    expect(screen.getByRole("status")).not.toHaveTextContent("Test game");
    fireEvent.click(
      screen.getByRole("button", { name: "Dismiss notification" }),
    );
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("does not show an add notice when restoring a cart or increasing quantity", () => {
    localStorage.setItem(
      "cart_items",
      JSON.stringify([{ ...game, quantity: 1 }]),
    );
    renderCart();
    expect(screen.getByLabelText("Cart quantity")).toHaveTextContent("1");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    fireEvent.click(screen.getByRole("button", { name: "Increase quantity" }));
    expect(screen.getByLabelText("Cart quantity")).toHaveTextContent("2");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("uses the selected language", () => {
    renderCart("vi");
    fireEvent.click(screen.getByRole("button", { name: "Add game" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      vn.user.productAddedToCart,
    );
    expect(
      screen.getByRole("button", { name: vn.user.dismissNotification }),
    ).toBeInTheDocument();
  });

  it("notifies when removing a game and persists the empty cart", () => {
    localStorage.setItem(
      "cart_items",
      JSON.stringify([{ ...game, quantity: 2 }]),
    );
    renderCart();
    fireEvent.click(screen.getByRole("button", { name: "Remove game" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Product removed from cart",
    );
    expect(screen.getByRole("status")).toHaveTextContent(game.name);
    expect(screen.getByLabelText("Cart quantity")).toHaveTextContent("0");
    expect(localStorage.getItem("cart_items")).toBeNull();
    act(() => vi.advanceTimersByTime(4000));
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("notifies only when decreasing quantity removes the last unit", () => {
    localStorage.setItem(
      "cart_items",
      JSON.stringify([{ ...game, quantity: 2 }]),
    );
    renderCart();
    fireEvent.click(screen.getByRole("button", { name: "Decrease quantity" }));
    expect(screen.getByLabelText("Cart quantity")).toHaveTextContent("1");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    fireEvent.click(screen.getByRole("button", { name: "Decrease quantity" }));
    expect(screen.getByLabelText("Cart quantity")).toHaveTextContent("0");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Product removed from cart",
    );
  });

  it("does not report a removal when the item does not exist", () => {
    renderCart();
    fireEvent.click(
      screen.getByRole("button", { name: "Remove missing game" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Decrease quantity" }));
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("replaces an add notice with a localized remove notice", () => {
    renderCart("vi");
    fireEvent.click(screen.getByRole("button", { name: "Add game" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove game" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      vn.user.productRemovedFromCart,
    );
    expect(
      screen.queryByText(vn.user.productAddedToCart),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: vn.user.dismissNotification }),
    );
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });
});
