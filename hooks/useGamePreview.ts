"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { FocusEvent, PointerEvent } from "react";

const DESKTOP_QUERY =
  "(min-width: 800px) and (any-hover: hover) and (any-pointer: fine)";
const HOVER_DELAY = 200;
const IDLE_RELEASE_DELAY = 15_000;
const listeners = new Set<() => void>();
let desktopMedia: MediaQueryList | undefined;
let activePreview: (() => void) | undefined;

function media() {
  return (desktopMedia ??= window.matchMedia(DESKTOP_QUERY));
}

function previewEnabled() {
  return media().matches && document.visibilityState === "visible";
}

function notifyPolicy() {
  listeners.forEach((listener) => listener());
}

function subscribePolicy(listener: () => void) {
  if (!listeners.size) {
    media().addEventListener("change", notifyPolicy);
    document.addEventListener("visibilitychange", notifyPolicy);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      media().removeEventListener("change", notifyPolicy);
      document.removeEventListener("visibilitychange", notifyPolicy);
      desktopMedia = undefined;
    }
  };
}

function releaseVideo(video: HTMLVideoElement | null) {
  if (!video) return;
  video.pause();
  video.removeAttribute("src");
  video.load();
}

/** One playback policy for every game card; no source or animation on mobile. */
export function useGamePreviewEnabled() {
  return useSyncExternalStore(subscribePolicy, previewEnabled, () => false);
}

export function useGamePreview(previewVideo?: string) {
  const enabled = useGamePreviewEnabled();
  const containerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intent = useRef(false);
  const source = useRef<string | undefined>(undefined);
  const playRequest = useRef(0);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const [videoSrc, setVideoSrc] = useState<string>();
  const [isActive, setIsActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const unload = useCallback(() => {
    clearTimeout(idleTimer.current);
    releaseVideo(videoRef.current);
    source.current = undefined;
    setVideoSrc(undefined);
  }, []);

  const stop = useCallback(function stopPreview() {
    playRequest.current += 1;
    intent.current = false;
    clearTimeout(hoverTimer.current);
    clearTimeout(idleTimer.current);
    setIsActive(false);
    setIsPlaying(false);
    videoRef.current?.pause();
    if (videoRef.current?.readyState) videoRef.current.currentTime = 0;
    if (activePreview === stopPreview) activePreview = undefined;
    if (source.current)
      idleTimer.current = setTimeout(unload, IDLE_RELEASE_DELAY);
  }, [unload]);

  const play = useCallback(() => {
    const video = videoRef.current;
    if (
      !video ||
      !intent.current ||
      activePreview !== stop ||
      !previewEnabled()
    )
      return;
    const request = ++playRequest.current;
    video.muted = true;
    void video.play().catch(() => {
      // Ignore an interrupted old play request when another preview has taken over.
      if (
        request === playRequest.current &&
        intent.current &&
        activePreview === stop &&
        videoRef.current === video
      ) {
        stop();
        unload();
      }
    });
  }, [stop, unload]);

  const start = useCallback(() => {
    if (!previewEnabled() || intent.current) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (
      !rect ||
      rect.width <= 0 ||
      rect.height <= 0 ||
      rect.bottom <= 0 ||
      rect.top >= window.innerHeight
    )
      return;
    intent.current = true;
    clearTimeout(idleTimer.current);
    hoverTimer.current = setTimeout(() => {
      if (!intent.current || !previewEnabled()) return;
      activePreview?.();
      activePreview = stop;
      setIsActive(true);
      if (!previewVideo) return;
      if (source.current !== previewVideo) {
        source.current = previewVideo;
        setVideoSrc(previewVideo);
      } else play();
    }, HOVER_DELAY);
  }, [previewVideo, play, stop]);

  useEffect(() => {
    const video = videoRef.current;
    if (videoSrc && enabled) play();
    return () => {
      if (video?.getAttribute("src") === videoSrc) releaseVideo(video);
    };
  }, [videoSrc, enabled, play]);

  useEffect(() => {
    if (!enabled) {
      stop();
      unload();
    }
  }, [enabled, stop, unload]);

  useEffect(() => {
    if (!enabled) return;
    const card = containerRef.current;
    if (!card) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) {
        stop();
        unload();
      }
    });
    observer.observe(card);
    // Recover a mouse already over the server-rendered card when hydration completes.
    if (enabled && card.matches(":hover")) start();
    return () => observer.disconnect();
  }, [enabled, start, stop, unload]);

  useEffect(
    () => () => {
      intent.current = false;
      clearTimeout(hoverTimer.current);
      clearTimeout(idleTimer.current);
      if (activePreview === stop) activePreview = undefined;
      releaseVideo(videoRef.current);
    },
    [stop],
  );

  const active = enabled && isActive;
  return {
    enabled,
    active,
    isPlaying: enabled && isPlaying,
    videoSrc: enabled ? videoSrc : undefined,
    containerRef,
    videoRef,
    panelClass: `${enabled ? "transition-[height] duration-700 ease-in-out" : "transition-none"} ${active ? "h-[300px]" : "h-[275px]"}`,
    footerClass: `${enabled ? "transition-colors duration-700 ease-in-out" : "transition-none"} ${active ? "bg-[#2A3240]" : "bg-surface-card"}`,
    interactionProps: {
      onPointerEnter: (event: PointerEvent<HTMLElement>) => {
        if (event.pointerType === "mouse") start();
      },
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        if (event.pointerType === "mouse") start();
      },
      onPointerLeave: stop,
      onFocus: start,
      onBlur: (event: FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          stop();
      },
    },
    onPlaying: () => {
      if (intent.current && activePreview === stop && previewEnabled())
        setIsPlaying(true);
      else videoRef.current?.pause();
    },
    onError: () => {
      stop();
      unload();
    },
  };
}
