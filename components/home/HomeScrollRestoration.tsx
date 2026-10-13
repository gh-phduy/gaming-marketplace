"use client";

import { useLayoutEffect } from "react";
import { HOME_CATEGORY_SCROLL_KEY } from "./home-scroll-restoration";

/**
 * Maximum duration to wait for the layout to stabilize before revealing (ms).
 */
const MAX_RESTORE_DURATION = 1500;

/**
 * Number of consecutive animation frames where scrollHeight remains unchanged
 * to consider the layout fully stabilized.
 */
const STABLE_FRAME_TARGET = 8;

/**
 * Height change tolerance in pixels.
 */
const HEIGHT_TOLERANCE = 2;

/**
 * HomeScrollRestoration Component
 *
 * Restores the scroll position when returning to the homepage from a category page.
 *
 * How it works:
 * 1. Inside useLayoutEffect (before paint), block visible content via a black overlay.
 * 2. Continuously scrollTo the saved position on every animation frame.
 * 3. Wait until scrollHeight stabilizes (doesn't change for STABLE_FRAME_TARGET frames).
 * 4. Reveal the page content with a smooth fade-out transition.
 */
export default function HomeScrollRestoration() {
  useLayoutEffect(() => {
    const savedScrollY = window.sessionStorage.getItem(
      HOME_CATEGORY_SCROLL_KEY,
    );

    if (!savedScrollY) return;

    const scrollY = Number(savedScrollY);
    if (!Number.isFinite(scrollY) || scrollY <= 0) {
      window.sessionStorage.removeItem(HOME_CATEGORY_SCROLL_KEY);
      return;
    }

    // Remove immediately to prevent re-triggering if the component re-mounts
    window.sessionStorage.removeItem(HOME_CATEGORY_SCROLL_KEY);

    const htmlEl = document.documentElement;
    const body = document.body;

    // Save previous scroll behavior
    const prevScrollBehavior = htmlEl.style.scrollBehavior;

    // Disable smooth scrolling temporarily to prevent layout jumping
    htmlEl.style.scrollBehavior = "auto";

    // Create a temporary overlay to cover the viewport instead of hiding the body.
    // This maintains the original layout, avoids layout reflows,
    // and prevents visual white flashes since the overlay matches the dark theme color.
    const overlay = document.createElement("div");
    overlay.setAttribute("data-scroll-restore-overlay", "");
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: var(--color-midnight-850, #0a0a0f);
      transition: opacity 150ms ease-out;
      pointer-events: none;
    `;
    body.appendChild(overlay);

    // Scroll immediately to the saved position
    window.scrollTo({ top: scrollY, left: 0, behavior: "auto" });

    const startTime = performance.now();
    let lastScrollHeight = htmlEl.scrollHeight;
    let stableFrames = 0;
    let frameId = 0;
    let fadeTimer = 0;
    const removeTimer = 0;

    const restoreScroll = () => {
      window.scrollTo({ top: scrollY, left: 0, behavior: "auto" });
    };

    const reveal = () => {
      // Perform a final scroll adjustment
      restoreScroll();

      // Fade out the overlay
      overlay.style.opacity = "0";

      // Restore original scroll styles
      htmlEl.style.scrollBehavior = prevScrollBehavior;

      // Remove overlay element after fade-out transition finishes
      fadeTimer = window.setTimeout(() => {
        overlay.remove();
      }, 170);
    };

    const waitForStableLayout = () => {
      // Enforce scroll position on every frame
      restoreScroll();

      const currentScrollHeight = htmlEl.scrollHeight;
      const heightDelta = Math.abs(currentScrollHeight - lastScrollHeight);

      if (heightDelta <= HEIGHT_TOLERANCE) {
        stableFrames += 1;
      } else {
        stableFrames = 0;
        lastScrollHeight = currentScrollHeight;
      }

      const elapsed = performance.now() - startTime;

      if (stableFrames >= STABLE_FRAME_TARGET || elapsed >= MAX_RESTORE_DURATION) {
        reveal();
        return;
      }

      frameId = window.requestAnimationFrame(waitForStableLayout);
    };

    frameId = window.requestAnimationFrame(waitForStableLayout);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
      overlay.remove();
      htmlEl.style.scrollBehavior = prevScrollBehavior;
    };
  }, []);

  return null;
}
