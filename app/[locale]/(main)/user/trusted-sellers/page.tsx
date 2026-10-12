import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Star } from "lucide-react";
import { getTrustedSellers } from "@/components/user/seller-profile.data";
import { getSellerProfilePath } from "@/components/user/seller-profile.route";

export default async function TrustedSellersPage() {
  const sellers = await getTrustedSellers();

  return (
    <main className="w-full bg-midnight-950 px-4 pt-36 pb-16 text-white">
      <div className="mx-auto w-full max-w-[1120px]">
        <h1 className="mb-6 text-3xl font-bold">Sellers</h1>

        {sellers.length === 0 ? (
          <div className="rounded-lg border border-midnight-700 bg-midnight-800 p-8 text-center text-steel-500">
            No sellers available.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 800:grid-cols-2">
            {sellers.map((seller) => (
              <Link
                key={seller.id}
                href={getSellerProfilePath(seller.id)}
                className="hover:border-forest-600 flex items-center gap-4 rounded-lg border border-midnight-700 bg-midnight-800 p-4 transition-colors"
              >
                <div className="relative h-14 w-14 overflow-hidden rounded-full">
                  <Image
                    src={seller.avatar || "/avt.jpg"}
                    alt={seller.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-semibold">
                    {seller.name}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-sm text-steel-500">
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck size={14} className="text-forest-500" />
                      {seller.tier}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Star size={14} className="text-yellow-400" />
                      {seller.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="text-right text-sm text-steel-500">
                  <p>{seller.successRate.toFixed(2)}% positive</p>
                  <p>{seller.offers.length} offers</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
