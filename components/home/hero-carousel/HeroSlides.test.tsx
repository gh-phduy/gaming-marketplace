import { useEffect, type ReactNode } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HeroSlides } from "./HeroSlides";

const { api } = vi.hoisted(() => ({ api: { scrollNext: vi.fn() } }));
type ChildrenProps = { children: ReactNode };
vi.mock("@/i18n/routing", () => ({
  Link: ({ children, href }: ChildrenProps & { href: string }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("@/lib/constants/hero", () => {
  const slides = [1, 2].map((n) => ({
    id: `slide-${n}`,
    image: `/desktop-${n}.webp`,
    mobileImage: `/mobile-${n}.webp`,
    alt: `Banner ${n}`,
  }));
  return { HERO_SLIDES: slides, HERO_SLIDES_TOPUP: slides };
});
vi.mock("./hooks", () => ({
  useHeroCarouselSelection: () => ({ current: 0, scrollTo: vi.fn() }),
}));
vi.mock("@/components/ui/carousel", () => ({
  Carousel: ({
    setApi,
    children,
  }: ChildrenProps & { setApi: (value: typeof api) => void }) => {
    useEffect(() => {
      setApi(api);
    }, [setApi]);
    return <div>{children}</div>;
  },
  CarouselContent: ({ children }: ChildrenProps) => <div>{children}</div>,
  CarouselItem: ({ children }: ChildrenProps) => <div>{children}</div>,
  CarouselPrevious: () => null,
  CarouselNext: () => null,
}));

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});
describe("hero image loading", () => {
  it("releases slides when the first image finished before hydration", () => {
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(
      true,
    );
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(
      640,
    );
    const view = render(<HeroSlides activeTab="digital" />);
    expect(screen.getByAltText("Banner 2")).toBeTruthy();
    view.unmount();
  });
  it("keeps hidden image requests and autoplay behind the first banner load", () => {
    vi.useFakeTimers();
    const view = render(<HeroSlides activeTab="digital" />);
    expect(screen.queryByAltText("Banner 2")).toBeNull();
    expect(
      screen
        .getByAltText("Banner 1")
        .closest("picture")
        ?.querySelector("source")?.srcset,
    ).toContain("mobile-1.webp");
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(api.scrollNext).not.toHaveBeenCalled();
    fireEvent.load(screen.getByAltText("Banner 1"));
    expect(screen.getByAltText("Banner 2")).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(api.scrollNext).toHaveBeenCalledTimes(1);
    view.unmount();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(api.scrollNext).toHaveBeenCalledTimes(1);
  });
});
