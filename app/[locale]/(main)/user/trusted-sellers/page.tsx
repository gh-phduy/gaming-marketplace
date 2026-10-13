import { getTrustedSellers } from "@/components/user/seller-profile.data";
import TrustedSellersClient from "@/components/user/TrustedSellersClient";
import { toDirectorySeller } from "@/lib/seller-directory";

export default async function TrustedSellersPage() {
  const sellers = await getTrustedSellers();
  return <TrustedSellersClient sellers={sellers.map(toDirectorySeller)} />;
}
