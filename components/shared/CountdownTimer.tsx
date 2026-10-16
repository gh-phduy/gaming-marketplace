"use client";

import { useState, useEffect, useMemo } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

/* ============================================
   TYPES
   ============================================ */

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownProps {
  /** Initial hours for countdown */
  initialHours?: number;
  /** Initial minutes for countdown */
  initialMinutes?: number;
  /** Initial seconds for countdown */
  initialSeconds?: number;
  /** Link for CTA button */
  ctaHref?: string;
  /** CTA button text */
  ctaText?: string;
}

/* ============================================
   CONSTANTS
   ============================================ */

const DEFAULTS = {
  initialHours: 1,
  initialMinutes: 32,
  initialSeconds: 48,
  ctaHref: "/product",
} as const;

/* ============================================
   SUB-COMPONENTS
   ============================================ */

interface TimeBlockProps {
  value: number;
  label: string;
}

/**
 * Individual time block (hours/minutes/seconds)
 */
function TimeBlock({ value, label }: TimeBlockProps) {
  const formattedValue = value.toString().padStart(2, "0");

  return (
    <div className="h-[60px] 1000:h-[75px] 1300:h-[90px] relative w-[48px] 1000:w-[56px] 1300:w-[64px] overflow-hidden rounded-lg bg-brand-light">
      {/* Value */}
      <div className="text-center pt-2 1000:pt-2.5 1300:pt-3">
        <span className="text-[24px] 1000:text-[30px] 1300:text-[34px] font-semibold text-dm-text-primary">
          {formattedValue}
        </span>
      </div>

      {/* Label */}
      <div className="absolute text-[10px] 1000:text-[12px] 1300:text-sm text-white bottom-0 bg-surface-overlay flex items-center justify-center w-full h-[16px] 1000:h-[18px] 1300:h-[20px]">
        <span>{label}</span>
      </div>
    </div>
  );
}

/**
 * Time separator (:)
 */
function TimeSeparator() {
  return (
    <div
      className="text-[20px] 1000:text-[25px] 1300:text-[30px] flex items-center text-dm-text-tertiary"
      aria-hidden="true"
    >
      <span>:</span>
    </div>
  );
}

/* ============================================
   MAIN COMPONENT
   ============================================ */

/**
 * Countdown Component
 *
 * Countdown timer with hover CTA button
 */
export default function Countdown({
  initialHours = DEFAULTS.initialHours,
  initialMinutes = DEFAULTS.initialMinutes,
  initialSeconds = DEFAULTS.initialSeconds,
  ctaHref = DEFAULTS.ctaHref,
  ctaText,
}: CountdownProps) {
  const t = useTranslations("home");
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    hours: initialHours,
    minutes: initialMinutes,
    seconds: initialSeconds,
  });

  const buttonText = ctaText || t("seeAllProducts");

  // Countdown logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        let { hours, minutes, seconds } = prevTime;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // Timer finished
          return { hours: 0, minutes: 0, seconds: 0 };
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Check if timer is finished
  const isFinished = useMemo(
    () =>
      timeLeft.hours === 0 &&
      timeLeft.minutes === 0 &&
      timeLeft.seconds === 0,
    [timeLeft]
  );

  return (
    <div className="flex h-full py-4 1000:py-6 1300:py-10 flex-col group justify-center items-center gap-y-1 1000:gap-y-2">
      {/* Heading */}
      <h2 className="text-[20px] 1000:text-[28px] 1300:text-[35px] text-center text-dm-text-primary font-bold">
        {t("bestDealsOfTheWeek")}
      </h2>

      {/* Description */}
      <p className="text-[12px] 1000:text-[14px] 1300:text-[16px] max-w-[300px] 1000:max-w-[400px] 1300:max-w-[450px] text-center font-medium text-dm-text-muted">
        {t("doNotMissTheBestOffer")}
      </p>

      {/* Timer Container */}
      <div
        className="h-[60px] 1000:h-[75px] 1300:h-[90px] mt-4 1000:mt-6 1300:mt-10 w-full relative"
        role="timer"
        aria-label={`Time remaining: ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds`}
      >
        {/* Countdown Timer */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-100 ease-out group-hover:opacity-0 transition-all duration-1000 flex justify-center gap-x-3 1000:gap-x-4 1300:gap-x-6">
          <TimeBlock value={timeLeft.hours} label={t("hours")} />
          <TimeSeparator />
          <TimeBlock value={timeLeft.minutes} label={t("minutes")} />
          <TimeSeparator />
          <TimeBlock value={timeLeft.seconds} label={t("seconds")} />
        </div>

        {/* CTA Button (shows on hover) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 ease-out group-hover:opacity-100 transition-all duration-1000">
          <Link
            href={ctaHref}
            className="relative bg-dm-accent-green hover:bg-dm-accent-green-hover w-[200px] 1000:w-[230px] 1300:w-[260px] text-dm-text-primary flex items-center justify-center font-semibold text-[12px] 1000:text-[14px] 1300:text-[15px] rounded-lg h-10 1000:h-11 1300:h-12 transition-colors"
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
}
