import { Link } from "@/i18n/routing";
import { IoIosArrowForward } from "react-icons/io";
import { CanvasTextImage } from "./TextImageCanvas";

interface SectionHeaderProps {
  headingId: string;
  headingText: string;
  title: string;
  actionText?: string;
  viewAllHref?: string;
  viewAllAriaLabel?: string;
  containerClassName?: string;
  titleClassName?: string;
}

export default function SectionHeader({
  headingId,
  headingText,
  title,
  actionText = "View All",
  viewAllHref = "/product",
  viewAllAriaLabel,
  containerClassName = "mb-6",
  titleClassName,
}: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${containerClassName}`}>
      <h2 id={headingId} className="sr-only">
        {headingText}
      </h2>

      <CanvasTextImage
        className={titleClassName}
        text={title}
        imageUrl="/text-img.svg"
        size="24px"
        aria-hidden="true"
      />

      <Link
        prefetch={false}
        href={viewAllHref}
        className="flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm text-[#C0C3C9] transition-colors hover:text-white"
        aria-label={viewAllAriaLabel || `View all ${headingText.toLowerCase()}`}
      >
        <span>{actionText}</span>
        <IoIosArrowForward aria-hidden="true" />
      </Link>
    </div>
  );
}
