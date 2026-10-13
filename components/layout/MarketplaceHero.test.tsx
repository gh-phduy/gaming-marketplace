import { useEffect, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MarketplaceHero from "./MarketplaceHero";
const state = vi.hoisted(() => ({
  pathname: "/",
  mounts: vi.fn(),
  unmounts: vi.fn(),
}));
vi.mock("@/i18n/routing", () => ({ usePathname: () => state.pathname }));
vi.mock("@/components/home/HeroCarousel", () => ({
  HeroCarousel: ({ activeTab }: { activeTab: string }) => {
    const [slide, setSlide] = useState(1);
    useEffect(() => {
      state.mounts();
      return () => state.unmounts();
    }, []);
    return (
      <button onClick={() => setSlide((value) => value + 1)}>
        {activeTab} slide {slide}
      </button>
    );
  },
}));
beforeEach(() => {
  state.pathname = "/";
  state.mounts.mockClear();
  state.unmounts.mockClear();
});
describe("persistent marketplace Hero", () => {
  it("keeps carousel state and the same mounted component when switching tabs both ways", () => {
    const { rerender } = render(<MarketplaceHero />);
    fireEvent.click(screen.getByRole("button"));
    state.pathname = "/direct-top-up";
    rerender(<MarketplaceHero />);
    expect(screen.getByRole("button")).toHaveTextContent("topup slide 2");
    state.pathname = "/";
    rerender(<MarketplaceHero />);
    expect(screen.getByRole("button")).toHaveTextContent("digital slide 2");
    expect(state.mounts).toHaveBeenCalledTimes(1);
    expect(state.unmounts).not.toHaveBeenCalled();
  });
  it.each([
    "/direct-top-up/mobile-games/pubg-mobile",
    "/account",
    "/user/trusted-sellers",
  ])("hides Hero on %s", (pathname) => {
    state.pathname = pathname;
    render(<MarketplaceHero />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
