import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { UserMenuContent } from "./UserMenuContent";
const push=vi.hoisted(()=>vi.fn());
vi.mock("@/i18n/routing",()=>({useRouter:()=>({push})}));
it("opens the real buyer history section and closes the account menu",()=>{
 const close=vi.fn(); render(<UserMenuContent t={key=>key} onNavigate={close}/>);
 fireEvent.click(screen.getByRole("button",{name:"myOrders"}));
 expect(close).toHaveBeenCalledOnce(); expect(push).toHaveBeenCalledWith("/account/dashboard#dashboard-recent-orders");
});
