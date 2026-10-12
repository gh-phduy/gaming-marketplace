// Product and Seller Types for TanStack Query Integration

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  isVerified?: boolean;
  badge: string;
  tier: string;
  rating: number;
  successRate: number;
  totalFeedbacks: number;
  timezone: string;
  totalSales: number;
  positiveFeedbacks: number;
  negativeFeedbacks: number;
}

export interface Product {
  id: string;
  name: string;
  type: string;
  platform: string;
  edition: string;
  delivery: string;
  activationRegion: string;
  price: number;
  currency: string;
  images: string[];
  description?: string;
}

export interface PurchaseCardProps {
  product: Product;
  seller: Seller;
  onAddToCart?: () => void;
  onCheckout?: () => void;
  onChat?: () => void;
}

// Example API Response Types
export interface ProductApiResponse {
  data: Product;
  seller: Seller;
}

// Example TanStack Query Hook Usage:
/*
import { useQuery } from '@tanstack/react-query';
import { ProductApiResponse } from '@/types/product';

export function useProduct(productId: string) {
    return useQuery<ProductApiResponse>({
        queryKey: ['product', productId],
        queryFn: async ({ signal }) => {
            const response = await fetch(`/api/products/${productId}`, { signal });
            if (!response.ok) throw new Error('Failed to fetch product');
            return response.json();
        }
    });
}

// Usage in component:
const { data, isLoading, error } = useProduct('product-id');

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error loading product</div>;
if (!data) return null;

return (
    <PurchaseCard
        product={data.data}
        seller={data.seller}
        onAddToCart={() => addToCart(data.data.id)}
        onCheckout={() => checkout(data.data.id)}
        onChat={() => openChat(data.seller.id)}
    />
);
*/
