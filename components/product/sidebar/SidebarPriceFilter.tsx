import { useMemo } from "react";
import { useProductFilter } from "@/contexts/ProductFilterContext";
import { getPricePresets, getVisiblePriceRange } from "@/lib/price-filter";
import PriceChartSlider from "./price-filter/PriceChartSlider";
import PriceInputs from "./price-filter/PriceInputs";
import PriceRangeList from "./price-filter/PriceRangeRadioList";
import { useTranslations } from "next-intl";

export default function SidebarPriceFilter({
  prices,
  ceiling,
  onFilterChange,
}: {
  prices: number[];
  ceiling: number;
  onFilterChange?: () => void;
}) {
  const t = useTranslations("product");
  const { priceRange, setPriceRange } = useProductFilter();
  const range = getVisiblePriceRange(priceRange, ceiling);
  const presets = useMemo(
    () => getPricePresets(prices, ceiling),
    [prices, ceiling],
  );
  function change(min: number, max: number) {
    setPriceRange({ min, max: max === ceiling ? Infinity : max });
    onFilterChange?.();
  }
  return (
    <section className="w-full space-y-4" aria-label={t("price")}>
      <h3 className="text-xl font-bold text-white">{t("price")}</h3>
      <PriceChartSlider
        minPrice={range.min}
        maxPrice={range.max}
        sliderMax={ceiling}
        prices={prices}
        onPriceChange={change}
      />
      <PriceInputs
        min={range.min}
        max={range.max}
        ceiling={ceiling}
        onChange={change}
      />
      <PriceRangeList
        ranges={presets}
        minPrice={range.min}
        maxPrice={range.max}
        onRangeSelect={change}
      />
    </section>
  );
}
