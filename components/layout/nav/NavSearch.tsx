import { useTranslations } from "next-intl";

interface NavSearchProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function NavSearch({
  value,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
}: NavSearchProps) {
  const t = useTranslations("common");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative min-w-0 flex-1 cursor-pointer text-steel-300">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className="h-9 w-full min-w-0 cursor-text bg-surface-overlay px-3 text-sm text-dm-text-primary caret-white focus:outline-hidden focus-visible:ring-2 focus-visible:ring-state-focus 1200:h-10 1200:px-4 1200:text-base"
        aria-label="Search products"
        placeholder=""
      />
      {!value && (
        <div
          className="pointer-events-none absolute inset-y-0 right-3 left-3 flex min-w-0 items-center gap-x-1 overflow-hidden text-sm whitespace-nowrap 1200:right-4 1200:left-4 1200:text-base"
          aria-hidden="true"
        >
          <span className="hidden shrink-0 1200:inline">{t("searchBy")}</span>
          <span className="truncate font-bold">{t("product")}</span>
        </div>
      )}
    </div>
  );
}
