const popularImageNames: Record<string, string> = {
  "007-first-light-pc_icon-455x325_1.jpg": "007-first-light-pc_icon-1200-600_1.jpg",
  "control-resonant-pc_icon-455x325_2.jpg": "control-resonant-pc_icon-1200-600_2.jpg",
  "ea-sports-fc-27-pc_icon-455x325_1.jpg": "ea-sports-fc-27-ps5-account_icon-1200-600_1.jpg",
  "onimusha-way-of-the-sword-pc_icon-455x325_2.jpg": "onimusha-way-of-the-sword-pc_icon-1200-600_2.jpg",
  "silent-hill-townfall-pc_icon-455x325_1.jpg": "silent-hill-townfall-pc_icon-1200-600_1.jpg",
  "star-wars-galactic-racer-pc_icon-455x325_3.jpg": "star-wars-galactic-racer-pc_icon-1200-600_3.jpg",
  "the-blood-of-dawnwalker-pc_icon-455x325_2.jpg": "the-blood-of-dawnwalker-pc_icon-1200-600_2.jpg",
  "wardogs-pc_icon-455x325_2.jpg": "wardogs-pc_icon-1200-600_2.jpg",
};

// Filenames verified in Storage; unmatched products keep their existing image.
const largeImageFiles: Record<string, string[]> = {
  popular_game: Object.values(popularImageNames),
  new_on_difmark: [
    "clive-barkers-hellraiser-revival-pc_icon-1200-600_1.jpg",
    "gears-of-war-e-day-pc_icon-1200-600_2.jpg",
    "graveyard-keeper-2-pc_icon-1200-600_2.jpg",
    "halloween-the-game-pc_icon-1200-600_3.jpg",
    "marvels-wolverine-ps5_icon-1200-600_8.jpg",
    "minecraft-dungeons-2-pc_icon-1200-600_2.jpg",
    "nba-2k27-pc_icon-1200-600_2.jpg",
    "runescape-dragonwilds-pc_icon-1200-600_2.jpg",
  ],
  under_price: [],
  up_coming: [
    "call-of-duty-modern-warfare-4-pc_icon-1200-600_1.jpg",
    "castlevania-belmonts-curse-pc_icon-1200-600_1.jpg",
    "fable-xbox-series_icon-1200-600_2.jpg",
    "grand-theft-auto-vi-ps5_icon-1200-600_3.jpg",
    "persona-4-revival-pc_icon-1200-600_4.jpg",
    "phantom-blade-zero-pc_icon-1200-600_2.png",
    "tomb-raider-legacy-of-atlantis-pc_icon-1200-600_1.jpg",
    "warhammer-40000-dawn-of-war-iv-pc_icon-1200-600_2.jpg",
  ],
  weekly_chart: [
    "bodycam-pc_icon-1200-600_5.jpg",
    "doom-eternal-pc_icon-1200-600_10.jpg",
    "doom-pc_icon-1200-600_32.jpg",
    "doom-plus-doom-ii-pc_icon-1200-600_1.jpg",
    "ea-sports-fc-27-pc_icon-1200-600_1.jpg",
    "fallout-76-pc_icon-1200-600_11.jpg",
    "peak-pc_icon-1200-600_4.jpg",
    "shape-of-dreams-pc_icon-1200-600_3.jpg",
  ],
};

export function getProductDetailImage(source: string) {
  try {
    const url = new URL(source);
    const prefix = "/storage/v1/object/public/Image/";
    if (!url.pathname.startsWith(prefix)) return source;
    const [folder, originalFilename, ...rest] = decodeURIComponent(url.pathname.slice(prefix.length)).split("/");
    if (rest.length || !Object.hasOwn(largeImageFiles, folder)) return source;
    const filename = (folder === "popular_game" ? popularImageNames[originalFilename] : undefined) ??
      originalFilename.replace(/(?:455x325|510x300)/, "1200-600").replace(/ \(\d+\)(?=\.[^.]+$)/, "");
    let targetFolder = folder;
    if (!largeImageFiles[folder].includes(filename)) {
      // The Weekly Chart GTA VI thumbnail shares the Upcoming cover.
      if (folder === "weekly_chart" && largeImageFiles.up_coming.includes(filename)) targetFolder = "up_coming";
      else return source;
    }
    url.pathname = `${prefix}${targetFolder}_large/${filename}`;
    return url.toString();
  } catch {
    return source;
  }
}
