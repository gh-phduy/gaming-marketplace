import { renderToString } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import { CanvasTextImage } from "./TextImageCanvas";
import messages from "@/messages/en.json";

describe("section title first render", () => {
  it("includes the translated title and its final dimensions in server HTML", () => {
    const html = renderToString(
      <NextIntlClientProvider locale="en" messages={messages}>
        <CanvasTextImage
          text="Popular games"
          imageUrl="/text-img.svg"
          size="24px"
        />
      </NextIntlClientProvider>,
    );
    expect(html).toContain(messages.home.popularGames);
    expect(html).toContain("width:calc(24px");
    expect(html).toContain("background-clip:text");
    expect(html).not.toContain("<canvas");
  });
});
