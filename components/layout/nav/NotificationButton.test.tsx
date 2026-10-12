import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import NotificationButton from "./NotificationButton";
import { addMarketplaceNotification } from "@/components/notifications/notification-store";
import messages from "@/messages/en.json";

const routing = vi.hoisted(() => ({ push:vi.fn() }));
vi.mock("@/i18n/routing", () => ({ useRouter: () => routing }));
beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });
afterEach(cleanup);

it("opens the payment notification through the locale-aware router without requiring redirect_status", () => {
  addMarketplaceNotification({id:"payment-pi_paid",kind:"payment",title:"Payment confirmed",description:"Control Resonant paid",
    href:"/checkout/success?payment_intent=pi_paid"},"buyer");
  render(<NextIntlClientProvider locale="ko" messages={messages} timeZone="UTC"><NotificationButton accountId="buyer" /></NextIntlClientProvider>);
  fireEvent.click(screen.getByRole("button",{name:messages.nav.notificationsTitle}));
  fireEvent.click(screen.getByRole("button",{name:/Payment confirmed/}));
  expect(routing.push).toHaveBeenCalledWith("/checkout/success?payment_intent=pi_paid");
});
