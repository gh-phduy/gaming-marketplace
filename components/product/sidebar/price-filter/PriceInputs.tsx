"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface PriceInputsProps {
  min: number;
  max: number;
  ceiling: number;
  onChange: (min: number, max: number) => void;
}

export default function PriceInputs({
  min,
  max,
  ceiling,
  onChange,
}: PriceInputsProps) {
  const [draftMin, setDraftMin] = useState(min.toFixed(2));
  const [draftMax, setDraftMax] = useState(max.toFixed(2));
  useEffect(() => setDraftMin(min.toFixed(2)), [min]);
  useEffect(() => setDraftMax(max.toFixed(2)), [max]);
  function update(type: "min" | "max", raw: string, commit = false) {
    const number = raw.trim() ? Number(raw) : NaN;
    const lower = type === "min" ? 0 : min;
    const upper = type === "min" ? max : ceiling;
    if (!commit) (type === "min" ? setDraftMin : setDraftMax)(raw);
    if (
      !commit &&
      (!Number.isFinite(number) || number < lower || number > upper)
    )
      return;
    const value = Number.isFinite(number)
      ? Math.round(Math.min(upper, Math.max(lower, number)) * 100) / 100
      : type === "min"
        ? min
        : max;
    if (commit) (type === "min" ? setDraftMin : setDraftMax)(value.toFixed(2));
    onChange(type === "min" ? value : min, type === "max" ? value : max);
  }
  return (
    <div className="flex items-center gap-3">
      {(["min", "max"] as const).map((type, index) => (
        <div key={type} className="contents">
          {index === 1 && <span className="text-gray-500">-</span>}
          <div className="relative min-w-0 flex-1">
            <span
              aria-hidden="true"
              className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-400"
            >
              $
            </span>
            <Input
              type="number"
              inputMode="decimal"
              aria-label={type === "min" ? "Minimum price" : "Maximum price"}
              min={type === "min" ? 0 : min}
              max={type === "min" ? max : ceiling}
              step="0.01"
              value={type === "min" ? draftMin : draftMax}
              onChange={(event) => update(type, event.target.value)}
              onBlur={(event) => update(type, event.target.value, true)}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
              className="no-spinner h-10 border-none bg-midnight-600 pl-7 text-sm font-medium text-white shadow-none focus-visible:ring-2 focus-visible:ring-forest-500"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
