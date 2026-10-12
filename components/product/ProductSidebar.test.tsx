import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";
import {
  ProductFilterProvider,
  useProductFilter,
} from "@/contexts/ProductFilterContext";
import {
  filterListingProducts,
  type Product,
} from "@/app/[locale]/(checkout)/product/_lib/product-listing";
import messages from "@/messages/en.json";
import ProductSidebar from "./ProductSidebar";

afterEach(cleanup);
const products: Product[] = [
  { id: 1, title: "Alpha", image: "", platform: "PC, PS5", price: 10 },
  { id: 2, title: "Beta", image: "", platform: "PS4, Xbox One", price: 25 },
  { id: 3, title: "Gamma", image: "", platform: "PC, Xbox One", price: 40 },
  {
    id: 4,
    title: "Delta",
    image: "",
    platform: "PS5, Nintendo Switch",
    price: 59.99,
  },
];
function Catalog() {
  const { priceRange, selectedPlatforms, resetProductFilters } =
    useProductFilter();
  const priceProducts = filterListingProducts(products, {
    selectedFilters: selectedPlatforms,
  });
  const visible = filterListingProducts(products, {
    selectedFilters: selectedPlatforms,
    priceRange,
  });
  return (
    <>
      <ProductSidebar
        products={products}
        priceProducts={priceProducts}
        platformProducts={filterListingProducts(products, { priceRange })}
      />
      <output aria-label="Matching games">
        {visible.map((p) => p.title).join(", ")}
      </output>
      <button onClick={resetProductFilters}>Clear all</button>
    </>
  );
}
function mount() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <ProductFilterProvider>
        <Catalog />
      </ProductFilterProvider>
    </NextIntlClientProvider>,
  );
}

describe("catalog sidebar interactions", () => {
  it("filters on actual prices, synchronizes chart selection and range presets, and resets", () => {
    const { container } = mount();
    const max = screen.getByRole("spinbutton", { name: "Maximum price" });
    expect(max).toHaveValue(60);
    expect(screen.getByLabelText("Matching games")).toHaveTextContent(
      "Alpha, Beta, Gamma, Delta",
    );
    fireEvent.change(max, { target: { value: "30" } });
    expect(screen.getByLabelText("Matching games")).toHaveTextContent(
      "Alpha, Beta",
    );
    expect(container.querySelector("[data-price-selection]")).toHaveAttribute(
      "width",
      "50",
    );
    expect(
      screen.getByRole("slider", { name: "Maximum price" }),
    ).toHaveAttribute("aria-valuenow", "30");
    fireEvent.click(screen.getByRole("radio", { name: /\$ 30 - \$ 60/ }));
    expect(screen.getByLabelText("Matching games")).toHaveTextContent(
      "Gamma, Delta",
    );
    expect(
      screen.getByRole("spinbutton", { name: "Minimum price" }),
    ).toHaveValue(30);
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(max).toHaveValue(60);
    expect(container.querySelector("[data-price-selection]")).toHaveAttribute(
      "width",
      "100",
    );
  });
  it("uses one platform dropdown, allows multiple tags, and updates the histogram and counts", () => {
    const { container } = mount();
    const initialChart = container
      .querySelector("[data-price-distribution]")
      ?.getAttribute("d");
    expect(
      screen.queryByRole("button", { name: /Product type|Region|Other types/ }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "PlayStation 5" }));
    expect(screen.getByLabelText("Matching games")).toHaveTextContent(
      "Alpha, Delta",
    );
    expect(
      container.querySelector("[data-price-distribution]")?.getAttribute("d"),
    ).not.toBe(initialChart);
    fireEvent.click(screen.getByRole("checkbox", { name: "PC" }));
    expect(screen.getByLabelText("Matching games")).toHaveTextContent(
      "Alpha, Gamma, Delta",
    );
    fireEvent.change(
      screen.getByRole("searchbox", { name: messages.product.searchPlatform }),
      { target: { value: "PS4" } },
    );
    expect(screen.getAllByRole("checkbox")).toHaveLength(1);
    expect(
      screen.getByRole("checkbox", { name: "PlayStation 4" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(screen.getAllByRole("checkbox")).toHaveLength(6);
    expect(screen.getByLabelText("Matching games")).toHaveTextContent(
      "Alpha, Beta, Gamma, Delta",
    );
  });
  it("allows clearing a price input and clamps invalid bounds on blur", () => {
    mount();
    const min = screen.getByRole("spinbutton", { name: "Minimum price" });
    const max = screen.getByRole("spinbutton", { name: "Maximum price" });
    fireEvent.change(min, { target: { value: "" } });
    fireEvent.change(min, { target: { value: "25.50" } });
    expect(screen.getByLabelText("Matching games")).toHaveTextContent(
      "Gamma, Delta",
    );
    fireEvent.change(max, { target: { value: "9999" } });
    fireEvent.blur(max);
    expect(max).toHaveValue(60);
    fireEvent.change(min, { target: { value: "-5" } });
    fireEvent.blur(min);
    expect(min).toHaveValue(0);
  });
});
