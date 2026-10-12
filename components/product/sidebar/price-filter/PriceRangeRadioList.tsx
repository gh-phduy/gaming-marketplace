"use client";

import { cn } from "@/lib/utils";
import { useId } from "react";

interface PriceRange {
  min: number;
  max: number;
  label: string;
  count: number;
}

interface PriceRangeListProps {
  ranges: PriceRange[];
  minPrice: number;
  maxPrice: number;
  onRangeSelect: (min: number, max: number) => void;
}

export default function PriceRangeList({
  ranges,
  minPrice,
  maxPrice,
  onRangeSelect,
}: PriceRangeListProps) {
  const name = useId();
  return (
    <div className="space-y-1 pt-2" role="radiogroup" aria-label="Price ranges">
      {ranges.map((item, index) => {
        const isChecked = minPrice === item.min && maxPrice === item.max;
        return (
          <label
            key={index}
            className="group -mx-1 flex cursor-pointer items-center justify-between rounded px-1 py-1.5 transition-colors hover:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name={name}
                  checked={isChecked}
                  onChange={() => onRangeSelect(item.min, item.max)}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-gray-500 bg-transparent transition-all checked:border-4 checked:border-[#65c756] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#65c756]"
                />
              </div>
              <span
                className={cn(
                  "text-sm transition-colors",
                  isChecked
                    ? "font-medium text-white"
                    : "text-gray-300 group-hover:text-white",
                )}
              >
                {item.label}
              </span>
            </div>
            <span className="text-xs font-medium text-gray-400">
              {item.count.toLocaleString().replace(/,/g, " ")}
            </span>
          </label>
        );
      })}
    </div>
  );
}
