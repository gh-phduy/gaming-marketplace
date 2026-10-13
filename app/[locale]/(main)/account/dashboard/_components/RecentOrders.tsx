"use client";

import {
  Package,
  ChevronRight,
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
} from "lucide-react";
import type { OrderSummary } from "../_lib/dashboard.data";

/* ==========================================================================
   TYPE DEFINITIONS & CONFIGURATIONS
   ========================================================================== */

interface RecentOrdersProps {
  orders: OrderSummary[];
  loading?: boolean;
  error?: string;
}

const statusConfig: Record<
  OrderSummary["status"],
  { icon: React.ElementType; color: string; bgColor: string; label: string }
> = {
  completed: {
    icon: CheckCircle2,
    color: "text-forest-500",
    bgColor: "bg-forest-500/10",
    label: "Completed",
  },
  pending: {
    icon: Clock,
    color: "text-dm-accent-yellow",
    bgColor: "bg-yellow-500/10",
    label: "Pending",
  },
  processing: {
    icon: Loader2,
    color: "text-dm-accent-blue",
    bgColor: "bg-blue-500/10",
    label: "Processing",
  },
  cancelled: {
    icon: XCircle,
    color: "text-dm-accent-red",
    bgColor: "bg-red-500/10",
    label: "Cancelled",
  },
  failed: { icon: XCircle, color: "text-dm-accent-red", bgColor: "bg-red-500/10", label: "Failed" },
  refunded: { icon: CheckCircle2, color: "text-steel-500", bgColor: "bg-steel-500/10", label: "Refunded" },
};

/* ==========================================================================
   MAIN COMPONENT: DashboardRecentOrders
   ========================================================================== */

/**
 * DashboardRecentOrders Component
 *
 * Renders a listing feed of the buyer/seller transaction orders.
 */
export default function DashboardRecentOrders({ orders, loading, error }: RecentOrdersProps) {
  return (
    <div
      id="dashboard-recent-orders"
      className="rounded-xl bg-midnight-800 p-5 ring-1 ring-midnight-650"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-steel-500" />
          <h2 className="text-base font-bold text-white">Recent Orders</h2>
        </div>
        <span className="text-xs text-steel-500">Latest 10 orders</span>
      </div>

      <div className="mt-4 space-y-3">
        {loading || error ? (
          <p role="status" className="py-8 text-center text-sm text-steel-500">
            {error || "Loading your orders…"}
          </p>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center text-sm text-steel-500">
            No recent orders
          </div>
        ) : (
          orders.map((order) => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;

            return (
              <div
                key={order.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-lg bg-midnight-750/50 px-4 py-3 ring-1 ring-midnight-650 transition-all duration-300 hover:bg-midnight-750 hover:shadow-md hover:ring-forest-500/30"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Status Indicator Icon wrap */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${status.bgColor}`}
                  >
                    <StatusIcon className={`h-4 w-4 ${status.color}`} />
                  </div>
                  
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {order.productName}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-steel-500">
                      <span>{order.id}</span>
                      <span>·</span>
                      <span>{order.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto pl-11 sm:pl-0">
                  {/* Hidden on mobile responsive text */}
                  <span
                    className={`hidden rounded-full px-2 py-0.5 text-xs font-medium sm:inline-flex ${status.bgColor} ${status.color}`}
                  >
                    {status.label}
                  </span>
                  
                  <span className="text-sm font-bold text-white">
                    {order.currencySymbol}
                    {order.amount.toFixed(2)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-steel-500 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

