import GameCardCartButton from "./GameCardCartButton";

interface GameCardCartOverlayProps {
  title: string;
  label: string;
  enabled: boolean;
  active: boolean;
  onAddToCart?: () => void;
}

export default function GameCardCartOverlay({
  title,
  label,
  enabled,
  active,
  onAddToCart,
}: GameCardCartOverlayProps) {
  return (
    <div
      className={
        enabled
          ? "absolute bottom-[57px] left-0 h-[65px] w-[200px] max-w-[calc(100%-110px)] transition-transform duration-700 ease-in-out " +
            (active ? "translate-x-0" : "-translate-x-full")
          : "absolute right-2 bottom-1.5 h-[44px] w-[44px] transition-none"
      }
    >
      <GameCardCartButton
        title={title}
        label={label}
        expanded={enabled}
        onClick={() => onAddToCart?.()}
      />
    </div>
  );
}
