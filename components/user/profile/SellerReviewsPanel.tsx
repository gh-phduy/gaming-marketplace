"use client";

import Image from "next/image";
import { MessageSquareReply, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SellerProfile, SellerReview } from "../seller-profile.data";

interface SellerReviewsPanelProps {
  profile: SellerProfile;
  onNotify: (message: string) => void;
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < rating
              ? "fill-amber-400 text-amber-400"
              : "text-steel-600 fill-transparent"
          }`}
        />
      ))}
    </span>
  );
}

function ReviewRow({
  review,
  onNotify,
}: {
  review: SellerReview;
  onNotify: (message: string) => void;
}) {
  const t = useTranslations("user");
  const isPositive = review.sentiment === "positive";

  return (
    <article className="rounded-lg border border-midnight-700 bg-midnight-800 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-midnight-700">
            <Image
              src={review.avatar}
              alt={review.author}
              fill
              sizes="44px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-bold text-white">
                {review.author}
              </h3>
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${
                  isPositive
                    ? "bg-forest-500/10 text-forest-500"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {isPositive ? (
                  <ThumbsUp className="h-3.5 w-3.5" />
                ) : (
                  <ThumbsDown className="h-3.5 w-3.5" />
                )}
                {isPositive ? t("positive") : t("negative")}
              </span>
            </div>
            <p className="mt-1 text-sm text-steel-500">{review.createdAt}</p>
          </div>
        </div>
        <RatingStars rating={review.rating} />
      </div>

      <p className="mt-4 text-sm leading-6 text-steel-300">{review.text}</p>

      {review.sellerReply ? (
        <div className="mt-4 rounded-md border border-midnight-650 bg-midnight-750 px-4 py-3">
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-steel-500 uppercase">
            <MessageSquareReply className="h-4 w-4" />
            {t("sellerReply")}
          </p>
          <p className="mt-2 text-sm text-steel-300">{review.sellerReply}</p>
        </div>
      ) : null}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => onNotify(t("reviewActionSaved"))}
          className="text-sm font-semibold text-forest-500 transition hover:text-forest-100"
        >
          {t("helpful")}
        </button>
      </div>
    </article>
  );
}

export default function SellerReviewsPanel({
  profile,
  onNotify,
}: SellerReviewsPanelProps) {
  const t = useTranslations("user");
  const home = useTranslations("home");

  const positiveCount =
    profile.totalFeedbacks > 0
      ? Math.round((profile.totalFeedbacks * profile.positiveFeedbacks) / 100)
      : profile.reviews.filter((review) => review.sentiment === "positive")
          .length;

  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-midnight-700 bg-midnight-800 p-4">
          <p className="text-sm text-steel-500">{home("rating")}</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {profile.rating.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border border-midnight-700 bg-midnight-800 p-4">
          <p className="text-sm text-steel-500">{t("positiveReviews")}</p>
          <p className="mt-2 text-3xl font-bold text-forest-500">
            {positiveCount}
          </p>
        </div>
        <div className="rounded-lg border border-midnight-700 bg-midnight-800 p-4">
          <p className="text-sm text-steel-500">{t("totalReviews")}</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {profile.totalFeedbacks.toLocaleString("en-US")}
          </p>
        </div>
      </div>

      {profile.reviews.length > 0 ? (
        <div className="space-y-3">
          {profile.reviews.map((review) => (
            <ReviewRow key={review.id} review={review} onNotify={onNotify} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-midnight-700 bg-midnight-800 px-4 py-10 text-center text-steel-500">
          {t("noReviewsYet")}
        </div>
      )}
    </section>
  );
}
