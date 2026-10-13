import { describe, expect, it } from "vitest";
import {
  getGamePreviewVideo,
  getHomepageGamePreviewVideo,
} from "./game-preview-video";
import { getPopularGamePreviewVideo } from "./popular-game-video";

const storage = "https://assets.example.test/storage/v1/object/public/Image/";

describe("homepage video associations", () => {
  it.each([
    [
      "popular_game/007-first-light-pc_icon-455x325_1.jpg",
      "popular_games_vd/007.webm",
    ],
    [
      "up_coming/fable-xbox-series_icon-455x325_2.jpg",
      "up_coming_vd/fable.webm",
    ],
    [
      "up_coming/castlevania-belmonts-curse-pc_icon-455x325_1.jpg",
      "up_coming_vd/castlenavia.webm",
    ],
    [
      "new_on_difmark/marvels-wolverine-ps5_icon-455x325_8.jpg",
      "new_on_difmark_vd/marvel_wolverine.webm",
    ],
    [
      "weekly_chart/doom-eternal-pc_icon-510x300_10.jpg",
      "weekly_chart_vd/doom_eternal.webm",
    ],
    ["weekly_chart/doom-pc_icon-510x300_32.jpg", "weekly_chart_vd/doom.webm"],
    [
      "weekly_chart/grand-theft-auto-vi-ps5_icon-455x325_3%20(1).jpg",
      "up_coming_vd/gta.webm",
    ],
    [
      "under_price/the-elder-scrolls-v-skyrim-pc_icon-455x325_36.jpg",
      "under_price_vd/the_elder.webm",
    ],
    [
      "under_price_large/human-fall-flat-pc_icon-900x600.webp",
      "under_price_vd/human_fall_flat.webm",
    ],
  ])("associates %s with its verified trailer", (cover, video) => {
    expect(getGamePreviewVideo(`${storage}${cover}?download=1#cover`)).toBe(
      `${storage}${video}`,
    );
  });

  it.each([
    "under_price/call-of-duty-black-ops-pc_icon-455x325_32.jpg",
    "new_on_difmark/valheim-pc_icon-455x325_11.jpg",
    "weekly_chart/psychonauts-2-pc_icon-510x300_5.jpg",
    "weekly_chart/shape-of-dreams-pc_icon-510x300_3.jpg",
    "weekly_chart/constructor-pc_icon-510x300_3.jpg",
    "seller_listings/doom-pc_icon-510x300_32.jpg",
    "weekly_chart/nested%2Fdoom-pc_icon-510x300_32.jpg",
  ])(
    "leaves the cover visible without substituting a different game: %s",
    (cover) => {
      expect(getGamePreviewVideo(`${storage}${cover}`)).toBeUndefined();
    },
  );

  it("preserves explicitly configured previews and the Popular resolver", () => {
    const image_url = `${storage}popular_game/007-first-light-pc_icon-455x325_1.jpg`;
    expect(getPopularGamePreviewVideo(image_url)).toBe(
      getGamePreviewVideo(image_url),
    );
    expect(
      getHomepageGamePreviewVideo({
        image_url,
        video_url: "https://videos.example.test/custom.webm",
      }),
    ).toBe("https://videos.example.test/custom.webm");
    expect(getHomepageGamePreviewVideo({ image_url, video_url: null })).toBe(
      `${storage}popular_games_vd/007.webm`,
    );
    expect(getGamePreviewVideo("not a URL")).toBeUndefined();
  });
});
