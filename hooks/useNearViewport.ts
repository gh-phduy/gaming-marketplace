"use client";

import { useEffect, useRef, useState } from "react";

/** Initialize offscreen carousels before they enter view, rather than at page load. */
export function useNearViewport(defer = true) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(!defer);

  useEffect(() => {
    if (!defer || ready) return;
    const element = ref.current;
    if (!element) return;
    const activate = () => setReady(true);
    if (!("IntersectionObserver" in window)) {
      activate();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          activate();
          observer.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(element);
    element.addEventListener("focusin", activate);
    return () => {
      observer.disconnect();
      element.removeEventListener("focusin", activate);
    };
  }, [defer, ready]);

  return { ref, ready: !defer || ready };
}
