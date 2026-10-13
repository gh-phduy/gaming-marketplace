import { lazy, Suspense, type ComponentType } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import LazyFloatingChat from "./LazyFloatingChat";
import type { ActiveConversation } from "./useFloatingChat";

const loading = vi.hoisted(() => ({
  starts: 0,
  resolve: undefined as
    | undefined
    | ((module: { default: ComponentType<any> }) => void),
}));
vi.mock("next/dynamic", () => ({
  default: () => {
    const Widget = lazy(() => {
      loading.starts += 1;
      return new Promise<{ default: ComponentType<any> }>((resolve) => {
        loading.resolve = resolve;
      });
    });
    return (props: any) => (
      <Suspense fallback={null}>
        <Widget {...props} />
      </Suspense>
    );
  },
}));

afterEach(cleanup);

describe("chat loading on demand", () => {
  it("does not load on page render and keeps the latest open request during loading", async () => {
    render(<LazyFloatingChat />);
    expect(loading.starts).toBe(0);
    const open = (id: string) => {
      const conversation = { id, recipientName: id } as ActiveConversation;
      act(() =>
        window.dispatchEvent(
          new CustomEvent("difmark:open-chat", { detail: conversation }),
        ),
      );
    };
    open("first seller");
    expect(loading.starts).toBe(1);
    open("second seller");
    await act(async () => {
      loading.resolve?.({
        default: ({ initialConversation }) => (
          <div>{initialConversation.recipientName}</div>
        ),
      });
    });
    expect(screen.getByText("second seller")).toBeInTheDocument();
    expect(screen.queryByText("first seller")).not.toBeInTheDocument();
    expect(loading.starts).toBe(1);
  });
});
