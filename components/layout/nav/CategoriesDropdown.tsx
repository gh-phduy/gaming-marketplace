"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AiOutlineAppstore } from "react-icons/ai";
import { BiSolidDownArrow } from "react-icons/bi";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

const NavCategories = dynamic(() => import("../NavCategories"));

interface CategoriesDropdownProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CategoriesDropdown({
  isOpen,
  onOpenChange,
}: CategoriesDropdownProps) {
  const tCommon = useTranslations("common");
  return (
    <Popover modal={true} open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger
        className="flex shrink-0 cursor-pointer items-center gap-x-2 rounded-lg bg-brand-light px-3 py-1 text-[16px] whitespace-nowrap text-dm-text-secondary transition-all duration-500 hover:text-dm-text-primary 1200:px-4"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={tCommon("allCategories")}
      >
        <span className="hidden 1200:inline">{tCommon("allCategories")}</span>
        <AiOutlineAppstore
          size={24}
          className="inline 1200:hidden"
          aria-hidden="true"
        />
        <BiSolidDownArrow
          size={12}
          className="transition-transform duration-500"
          style={{
            transform: isOpen ? "rotateX(180deg)" : "rotateX(0deg)",
            transformStyle: "preserve-3d",
          }}
          aria-hidden="true"
        />
      </PopoverTrigger>
      <PopoverContent
        className="w-auto rounded-lg border-none bg-surface-elevated/90 p-0 backdrop-blur-xs"
        align="start"
        sideOffset={20}
        alignOffset={-4}
        side="bottom"
      >
        <NavCategories />
      </PopoverContent>
    </Popover>
  );
}
