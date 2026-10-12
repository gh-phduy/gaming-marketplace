import { MdKeyboardArrowDown } from "react-icons/md";
import { PRODUCT_DESCRIPTION_CLASS } from "./product-layout";

export default function ProductDescription({
  description,
}: {
  description?: string;
}) {
  return (
    <div className={PRODUCT_DESCRIPTION_CLASS}>
      <span className="line-clamp-3 whitespace-pre-wrap">
        {description || "No description provided."}
      </span>
      <a
        href="#about-product"
        className="flex items-center gap-x-1 text-[#65c756]"
      >
        <span>Read more</span>
        <MdKeyboardArrowDown size={28} />
      </a>
    </div>
  );
}
