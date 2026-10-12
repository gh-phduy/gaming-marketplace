export default function ProductKeyFeatures({ title, description }: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col gap-y-3 rounded-lg bg-midnight-750 p-3 sm:gap-y-4 sm:p-5">
      <h3 className="text-sm font-semibold text-white uppercase sm:text-[16px]">{title || "Product details"}</h3>
      <p className="whitespace-pre-wrap text-sm text-[#9BA1AB] sm:text-[16px]">{description || "No description provided."}</p>
    </div>
  );
}
