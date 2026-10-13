import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";

const auth = vi.hoisted(() => ({
  getSession: vi.fn(), signOut: vi.fn(), unsubscribe: vi.fn(),
  onChange: undefined as undefined | ((event: string, session: any) => void),
}));
vi.mock("@/lib/supabase", () => ({ supabase: { auth: {
  getSession: auth.getSession,
  signOut: auth.signOut,
  onAuthStateChange: (callback: typeof auth.onChange) => {
    auth.onChange = callback;
    return { data: { subscription: { unsubscribe: auth.unsubscribe } } };
  },
} } }));

function Probe() {
  const { user, isLoading, logout } = useAuth();
  return <><span>{isLoading ? "Loading" : user?.name ?? "Guest"}</span><button onClick={logout}>Logout</button></>;
}
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  auth.getSession.mockResolvedValue({ data: { session: null } });
  auth.signOut.mockResolvedValue({});
});
afterEach(cleanup);

describe("auth after loading the SDK on demand", () => {
  it("restores an existing session and unsubscribes on unmount", async () => {
    auth.getSession.mockResolvedValue({ data: { session: { user: { id: "buyer", email: "buyer@example.test", user_metadata: { full_name: "Buyer" } } } } });
    const { unmount } = render(<AuthProvider><Probe /></AuthProvider>);
    expect(screen.getByText("Loading")).toBeInTheDocument();
    await screen.findByText("Buyer");
    unmount();
    expect(auth.unsubscribe).toHaveBeenCalledOnce();
  });
  it("receives later login events and still signs out through Supabase", async () => {
    render(<AuthProvider><Probe /></AuthProvider>);
    await screen.findByText("Guest");
    act(() => auth.onChange?.("SIGNED_IN", { user: { id: "buyer", email: "buyer@example.test", user_metadata: { full_name: "Buyer" } } }));
    expect(screen.getByText("Buyer")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Logout" }));
    await waitFor(() => expect(auth.signOut).toHaveBeenCalledOnce());
    await screen.findByText("Guest");
  });
  it("does not subscribe if unmounted before the dynamic import finishes", async () => {
    const { unmount } = render(<AuthProvider><Probe /></AuthProvider>);
    unmount();
    await act(async () => { await Promise.resolve(); });
    expect(auth.getSession).not.toHaveBeenCalled();
  });
});
