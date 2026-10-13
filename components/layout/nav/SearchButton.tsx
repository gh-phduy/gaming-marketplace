import { IoSearch } from "react-icons/io5";

interface SearchButtonProps {
  onClick?: () => void;
}

export default function SearchButton({ onClick }: SearchButtonProps) {
  return (
    <button
      className="flex w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-brand-light py-1 font-bold text-dm-text-tertiary transition-colors hover:text-dm-text-secondary 1200:w-12"
      aria-label="Search"
      onClick={onClick}
    >
      <IoSearch size={20} aria-hidden="true" />
    </button>
  );
}
