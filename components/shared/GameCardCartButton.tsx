import type { MouseEventHandler } from "react";
import { BsBasket3Fill } from "react-icons/bs";

interface GameCardCartButtonProps {
  title: string;
  label: string;
  expanded: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

export default function GameCardCartButton({
  title,
  label,
  expanded,
  onClick,
}: GameCardCartButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Add ${title} to cart`}
      className={
        "@container relative h-full w-full cursor-pointer bg-[#63c54c] text-white focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white " +
        (expanded
          ? "transition-colors hover:bg-[#57b541]"
          : "rounded-md transition-none")
      }
      style={{
        clipPath: expanded
          ? "polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)"
          : undefined,
      }}
    >
      {expanded && (
        <svg
          aria-hidden="true"
          viewBox="0 0 200 65"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <path
            d="M 171 0 L 191 32.5 L 171 65"
            fill="none"
            stroke="#354333"
            strokeWidth="3"
          />
        </svg>
      )}
      <span
        className={
          "relative flex h-full items-center justify-center gap-2.5 text-[14px] font-bold uppercase " +
          (expanded
            ? "w-[calc(100%-24px)] px-3 @max-[170px]:gap-2 @max-[170px]:px-1 @max-[170px]:text-[12px]"
            : "w-full")
        }
      >
        <BsBasket3Fill className="shrink-0" size={14} aria-hidden="true" />
        {expanded && <span>{label}</span>}
      </span>
    </button>
  );
}
