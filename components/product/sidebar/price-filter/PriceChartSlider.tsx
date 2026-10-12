"use client";

import { useId, useMemo } from "react";
import { Slider } from "@base-ui/react/slider";
import { getPriceHistogram } from "@/lib/price-filter";

interface PriceChartSliderProps {
  minPrice: number;
  maxPrice: number;
  sliderMax: number;
  prices: number[];
  onPriceChange: (min: number, max: number) => void;
}

export default function PriceChartSlider({
  minPrice,
  maxPrice,
  sliderMax,
  prices,
  onPriceChange,
}: PriceChartSliderProps) {
  const id = useId().replace(/:/g, "");
  const chart = useMemo(
    () => getPriceHistogram(prices, sliderMax),
    [prices, sliderMax],
  );
  const left = (minPrice / sliderMax) * 100;
  const width = ((maxPrice - minPrice) / sliderMax) * 100;
  return (
    <div className="px-2" data-price-chart>
      <svg
        viewBox="0 0 100 48"
        className="h-16 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Product price distribution"
      >
        <defs>
          <linearGradient id={id + "-fill"} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#65c756" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#65c756" stopOpacity="0.1" />
          </linearGradient>
          <clipPath id={id + "-selected"}>
            <rect
              data-price-selection
              x={left}
              y="0"
              width={width}
              height="48"
            />
          </clipPath>
        </defs>
        <path d={chart.area} fill="#465266" fillOpacity="0.35" />
        <path
          data-price-distribution
          d={chart.line}
          fill="none"
          stroke="#89929f"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <g clipPath={"url(#" + id + "-selected)"}>
          <path d={chart.area} fill={"url(#" + id + "-fill)"} />
          <path
            d={chart.line}
            fill="none"
            stroke="#65c756"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>
      <Slider.Root
        value={[minPrice, maxPrice]}
        min={0}
        max={sliderMax}
        step={0.01}
        largeStep={1}
        thumbCollisionBehavior="none"
        onValueChange={(values) => onPriceChange(values[0], values[1])}
      >
        <Slider.Control className="relative flex h-6 w-full touch-none items-center select-none">
          <Slider.Track className="relative h-1.5 w-full rounded-full bg-[#465266]">
            <Slider.Indicator className="absolute h-full rounded-full bg-[#65c756]" />
            {[0, 1].map((index) => (
              <Slider.Thumb
                key={index}
                index={index}
                getAriaLabel={() =>
                  index === 0 ? "Minimum price" : "Maximum price"
                }
                getAriaValueText={(_, value) => "$" + value.toFixed(2)}
                className="block size-5 cursor-grab rounded-full bg-[#65c756] ring-2 ring-white focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-[#65c756] active:cursor-grabbing"
              />
            ))}
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
    </div>
  );
}
