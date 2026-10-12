import ProductKeyFeatures from "./ProductKeyFeatures";

export default function ProductContent({ title, description }: { title?: string; description?: string }) {
  return (
    <div id="about-product" className="mb-6 flex w-full scroll-mt-24 flex-col gap-y-4 sm:mb-8 sm:gap-y-6">
      <h2 className="text-lg font-semibold text-white uppercase sm:text-xl md:text-[24px]">
        About product
      </h2>
      <ProductKeyFeatures title={title} description={description} />
    </div>
  );
}
