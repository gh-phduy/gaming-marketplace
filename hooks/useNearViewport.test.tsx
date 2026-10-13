import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useNearViewport } from "./useNearViewport";

function Harness() {
  const { ref, ready } = useNearViewport();
  return (
    <div ref={ref} data-testid="carousel" data-ready={ready}>
      <button>Slide</button>
    </div>
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("offscreen carousel initialization", () => {
  it("waits until near the viewport and stops observing once activated", () => {
    let callback!: IntersectionObserverCallback;
    const disconnect = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: IntersectionObserverCallback) {
          callback = cb;
        }
        observe() {}
        disconnect = disconnect;
      },
    );
    render(<Harness />);
    expect(screen.getByTestId("carousel")).toHaveAttribute(
      "data-ready",
      "false",
    );
    act(() =>
      callback(
        [{ isIntersecting: false }] as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      ),
    );
    expect(screen.getByTestId("carousel")).toHaveAttribute(
      "data-ready",
      "false",
    );
    act(() =>
      callback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      ),
    );
    expect(screen.getByTestId("carousel")).toHaveAttribute(
      "data-ready",
      "true",
    );
    expect(disconnect).toHaveBeenCalled();
  });

  it("activates immediately for keyboard navigation before an observer notification", () => {
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );
    render(<Harness />);
    fireEvent.focus(screen.getByRole("button", { name: "Slide" }));
    expect(screen.getByTestId("carousel")).toHaveAttribute(
      "data-ready",
      "true",
    );
  });
});
