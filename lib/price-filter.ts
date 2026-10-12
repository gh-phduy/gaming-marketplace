export interface PriceRange {
  min: number;
  max: number;
}
export const ALL_PRICES: PriceRange = { min: 0, max: Infinity };

export function getPriceCeiling(prices: number[]) {
  return Math.max(
    1,
    Math.ceil(
      prices.reduce(
        (max, price) =>
          Number.isFinite(price) && price >= 0 ? Math.max(max, price) : max,
        0,
      ),
    ),
  );
}

export function getVisiblePriceRange(
  range: PriceRange,
  ceiling: number,
): PriceRange {
  const max = Math.min(ceiling, Math.max(0, range.max));
  return { min: Math.min(max, Math.max(0, range.min)), max };
}

export function getPriceHistogram(
  prices: number[],
  ceiling: number,
  binCount = 24,
) {
  const bins = Array.from({ length: binCount }, () => 0);
  for (const price of prices) {
    if (!Number.isFinite(price) || price < 0 || price > ceiling) continue;
    bins[Math.min(binCount - 1, Math.floor((price / ceiling) * binCount))]++;
  }
  const peak = Math.max(1, ...bins);
  const points = bins.map(
    (count, index) =>
      `${(((index + 0.5) / binCount) * 100).toFixed(2)} ${(42 - (count / peak) * 36).toFixed(2)}`,
  );
  const line = `M0 42 ${points.map((point) => `L${point}`).join(" ")} L100 42`;
  return { bins, line, area: `${line} L100 48 L0 48 Z` };
}

export function getPricePresets(prices: number[], ceiling: number) {
  const boundaries = [0, 6, 30, 120, 400, ceiling].filter(
    (value) => value <= ceiling,
  );
  const edges = [...new Set(boundaries)].sort((a, b) => a - b);
  return edges.slice(0, -1).map((min, index) => {
    const max = edges[index + 1];
    return {
      min,
      max,
      label: `$ ${min} - $ ${max}`,
      count: prices.filter((price) => price >= min && price <= max).length,
    };
  });
}
