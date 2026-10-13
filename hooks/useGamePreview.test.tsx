import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import { useGamePreview } from "./useGamePreview";
import GamePreviewVideo from "@/components/shared/GamePreviewVideo";
import PopularGameCard from "@/components/home/PopularGameCard";
import UpcomingGameCard from "@/components/home/UpcomingGameCard";
import GameCard from "@/components/shared/GameCard";
import AddToCartCard from "@/components/product/AddToCartButton";
import messages from "@/messages/en.json";

vi.mock("next/image", () => ({
  default: ({ fill, ...props }: any) => <img {...props} />,
}));
vi.mock("@/i18n/routing", () => ({
  Link: ({ prefetch, ...props }: any) => <a {...props} />,
}));

let desktop = true;
let visibility = "visible";
const mediaListeners = new Set<() => void>();
let observers: Array<{
  callback: IntersectionObserverCallback;
  target?: Element;
}>;
let paused: WeakMap<HTMLMediaElement, boolean>;
let play: ReturnType<typeof vi.spyOn>;
let pause: ReturnType<typeof vi.spyOn>;
let load: ReturnType<typeof vi.spyOn>;

function Harness({
  name,
  src = "/preview.webm",
}: {
  name: string;
  src?: string;
}) {
  const preview = useGamePreview(src);
  return (
    <article
      ref={preview.containerRef}
      {...preview.interactionProps}
      data-testid={name}
      data-active={preview.active}
    >
      <button>{name}</button>
      <div className={preview.panelClass}>Cover</div>
      <GamePreviewVideo preview={preview} />
    </article>
  );
}

function hover(card: HTMLElement, pointerType = "mouse") {
  const event = new Event("pointerover", { bubbles: true });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  fireEvent(card, event);
}
function dwell() {
  act(() => {
    vi.advanceTimersByTime(200);
  });
}
function start(name: string) {
  const card = screen.getByTestId(name);
  hover(card);
  dwell();
  const video = card.querySelector("video")!;
  fireEvent.playing(video);
  return video;
}

describe("shared game preview policy", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    desktop = true;
    visibility = "visible";
    mediaListeners.clear();
    observers = [];
    paused = new WeakMap();
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        get matches() {
          return desktop;
        },
        addEventListener: (_: string, listener: () => void) =>
          mediaListeners.add(listener),
        removeEventListener: (_: string, listener: () => void) =>
          mediaListeners.delete(listener),
      })),
    );
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        entry: { callback: IntersectionObserverCallback; target?: Element };
        constructor(callback: IntersectionObserverCallback) {
          this.entry = { callback };
          observers.push(this.entry);
        }
        observe(target: Element) {
          this.entry.target = target;
        }
        disconnect() {}
      },
    );
    vi.spyOn(document, "visibilityState", "get").mockImplementation(
      () => visibility as DocumentVisibilityState,
    );
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      top: 0,
      bottom: 300,
      left: 0,
      right: 252,
      width: 252,
      height: 300,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    vi.spyOn(HTMLMediaElement.prototype, "paused", "get").mockImplementation(
      function (this: HTMLMediaElement) {
        return paused.get(this) ?? true;
      },
    );
    vi.spyOn(HTMLMediaElement.prototype, "readyState", "get").mockReturnValue(
      4,
    );
    play = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockImplementation(function (this: HTMLMediaElement) {
        paused.set(this, false);
        return Promise.resolve();
      });
    pause = vi
      .spyOn(HTMLMediaElement.prototype, "pause")
      .mockImplementation(function (this: HTMLMediaElement) {
        paused.set(this, true);
      });
    load = vi
      .spyOn(HTMLMediaElement.prototype, "load")
      .mockImplementation(() => {});
  });
  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("does not assign a source on a passing hover; releases media after idle", () => {
    render(<Harness name="A" />);
    const card = screen.getByTestId("A");
    hover(card);
    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(card.querySelector("video")).toBeNull();
    fireEvent.pointerLeave(card);
    dwell();
    expect(play).not.toHaveBeenCalled();
    const video = start("A");
    expect(video.getAttribute("src")).toBe("/preview.webm");
    fireEvent.pointerLeave(card);
    expect(video.paused).toBe(true);
    act(() => {
      vi.advanceTimersByTime(15_000);
    });
    expect(card.querySelector("video")).toBeNull();
    expect(video.hasAttribute("src")).toBe(false);
    expect(load).toHaveBeenCalled();
  });

  it("permits only one active preview across separate component roots", () => {
    render(<Harness name="A" />);
    render(<Harness name="B" src="/second.webm" />);
    const first = start("A"),
      second = start("B");
    expect(first.paused).toBe(true);
    expect(second.paused).toBe(false);
    expect(screen.getByTestId("A")).toHaveAttribute("data-active", "false");
    expect(screen.getByTestId("B")).toHaveAttribute("data-active", "true");
  });

  it("ignores touch input even on a wide viewport", () => {
    render(<Harness name="A" />);
    hover(screen.getByTestId("A"), "touch");
    dwell();
    expect(play).not.toHaveBeenCalled();
    expect(screen.getByTestId("A").querySelector("video")).toBeNull();
  });

  it("unloads every retained video on desktop-to-mobile changes", () => {
    render(
      <>
        <Harness name="A" />
        <Harness name="B" />
      </>,
    );
    const first = start("A"),
      second = start("B");
    act(() => {
      desktop = false;
      mediaListeners.forEach((listener) => listener());
    });
    expect(document.querySelectorAll("video")).toHaveLength(0);
    expect(first.paused && second.paused).toBe(true);
    expect(first.hasAttribute("src") || second.hasAttribute("src")).toBe(false);
    expect(screen.getByTestId("B").querySelector("div")).toHaveClass(
      "transition-none",
      "h-[275px]",
    );
  });

  it("stops and releases previews when the tab is hidden", () => {
    render(<Harness name="A" />);
    const video = start("A");
    act(() => {
      visibility = "hidden";
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(video.paused).toBe(true);
    expect(screen.getByTestId("A").querySelector("video")).toBeNull();
  });

  it("cancels pending work and releases media when a card leaves the viewport", () => {
    render(<Harness name="A" />);
    const card = screen.getByTestId("A");
    hover(card);
    const observer = observers.find((observer) => observer.target === card)!;
    act(() => {
      observer.callback(
        [{ isIntersecting: false }] as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      );
    });
    dwell();
    expect(play).not.toHaveBeenCalled();
    const video = start("A");
    act(() => {
      observer.callback(
        [{ isIntersecting: false }] as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      );
    });
    expect(video.paused).toBe(true);
    expect(card.querySelector("video")).toBeNull();
  });

  it("does not let a late aborted play request stop another card", async () => {
    let reject!: (reason: Error) => void;
    play.mockImplementationOnce(function (this: HTMLMediaElement) {
      paused.set(this, false);
      return new Promise<void>((_, rejectPromise) => {
        reject = rejectPromise;
      });
    });
    render(
      <>
        <Harness name="A" />
        <Harness name="B" />
      </>,
    );
    start("A");
    const second = start("B");
    await act(async () => {
      reject(new Error("AbortError"));
    });
    expect(second.paused).toBe(false);
    expect(screen.getByTestId("B")).toHaveAttribute("data-active", "true");
  });

  it("keeps the cover and clears failed media", () => {
    render(<Harness name="A" />);
    const video = start("A");
    fireEvent.error(video);
    expect(screen.getByTestId("A").querySelector("video")).toBeNull();
    expect(screen.getByText("Cover")).toBeInTheDocument();
    expect(pause).toHaveBeenCalled();
  });

  it.each([PopularGameCard, UpcomingGameCard, GameCard, AddToCartCard])(
    "%s keeps real cards static on mobile, including keyboard focus",
    (Card) => {
      desktop = false;
      const onAddToCart = vi.fn();
      const { container } = render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <Card
            title="Mobile game"
            previewVideo="/mobile.webm"
            onAddToCart={onAddToCart}
          />
        </NextIntlClientProvider>,
      );
      const article = container.querySelector("article")!;
      hover(article);
      fireEvent.focus(article);
      dwell();
      expect(container.querySelector("video")).toBeNull();
      expect(play).not.toHaveBeenCalled();
      expect(article.querySelector(".group")).toHaveClass(
        "transition-none",
        "h-[275px]",
      );
      const cart = screen.queryByRole("button", {
        name: "Add Mobile game to cart",
      });
      if (cart) {
        fireEvent.click(cart);
        expect(onAddToCart).toHaveBeenCalledOnce();
      }
      expect(observers).toHaveLength(0);
    },
  );

  it.each([PopularGameCard, UpcomingGameCard, GameCard, AddToCartCard])(
    "%s uses the shared desktop playback lifecycle",
    (Card) => {
      const onAddToCart = vi.fn();
      const { container } = render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <Card
            title="Desktop game"
            previewVideo="/actual-preview.webm"
            onAddToCart={onAddToCart}
          />
        </NextIntlClientProvider>,
      );
      const article = container.querySelector("article")!;
      expect(article.querySelector("video")).toBeNull();
      hover(article);
      dwell();
      const video = article.querySelector("video")!;
      fireEvent.playing(video);
      expect(video).toHaveAttribute("src", "/actual-preview.webm");
      expect(video.paused).toBe(false);
      expect(article.querySelector(".group")).toHaveClass("h-[300px]");
      const cartButton = screen.getByRole("button", {
        name: "Add Desktop game to cart",
      });
      fireEvent.click(cartButton);
      expect(onAddToCart).toHaveBeenCalledOnce();
      if (Card === PopularGameCard || Card === UpcomingGameCard) {
        expect(cartButton.closest("a")).toBeNull();
      }
      fireEvent.pointerLeave(article);
      expect(video.paused).toBe(true);
      expect(article.querySelector(".group")).toHaveClass("h-[275px]");
    },
  );

  it.each([PopularGameCard, UpcomingGameCard, GameCard, AddToCartCard])(
    "%s does not request a placeholder video when no preview is configured",
    (Card) => {
      const { container } = render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <Card title="No video game" />
        </NextIntlClientProvider>,
      );
      hover(container.querySelector("article")!);
      dwell();
      expect(container.querySelector("video")).toBeNull();
      expect(play).not.toHaveBeenCalled();
    },
  );
});
