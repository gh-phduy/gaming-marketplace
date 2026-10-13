// Verified public Storage filenames. Keep these local so rendering cards does
// not introduce a Storage listing request or download trailers on page load.
const previewFiles: Record<string, string> = {
  "007-first-light": "popular_games_vd/007.webm",
  "control-resonant": "popular_games_vd/control_resonant.webm",
  "ea-sports-fc-27": "popular_games_vd/ea_sport_fifa.webm",
  "onimusha-way-of-the-sword": "popular_games_vd/onimusha.webm",
  "silent-hill-townfall": "popular_games_vd/silent_hill_townfall.webm",
  "star-wars-galactic-racer": "popular_games_vd/start_war.webm",
  "the-blood-of-dawnwalker": "popular_games_vd/the_blood_of_dawnwalker.webm",
  wardogs: "popular_games_vd/wardogs.webm",
  "call-of-duty-modern-warfare-4": "up_coming_vd/call_of_duty.webm",
  "castlevania-belmonts-curse": "up_coming_vd/castlenavia.webm",
  fable: "up_coming_vd/fable.webm",
  "grand-theft-auto-vi": "up_coming_vd/gta.webm",
  "persona-4-revival": "up_coming_vd/persona_4.webm",
  "phantom-blade-zero": "up_coming_vd/phantom_blade.webm",
  "tomb-raider-legacy-of-atlantis": "up_coming_vd/tomb_raider.webm",
  "warhammer-40000-dawn-of-war-iv": "up_coming_vd/warhammer.webm",
  "gears-of-war-e-day": "new_on_difmark_vd/gears_of_war.webm",
  "graveyard-keeper-2": "new_on_difmark_vd/graveyard.webm",
  "halloween-the-game": "new_on_difmark_vd/halloween.webm",
  "marvels-wolverine": "new_on_difmark_vd/marvel_wolverine.webm",
  "minecraft-dungeons-2": "new_on_difmark_vd/minecraft.webm",
  "nba-2k27": "new_on_difmark_vd/nba.webm",
  "runescape-dragonwilds": "new_on_difmark_vd/run_scape.webm",
  "doom-eternal": "weekly_chart_vd/doom_eternal.webm",
  doom: "weekly_chart_vd/doom.webm",
  "doom-plus-doom-ii": "weekly_chart_vd/doom_plus_doom.webm",
  "fallout-76": "weekly_chart_vd/fallout.webm",
  peak: "weekly_chart_vd/peak.webm",
  "dead-by-daylight": "under_price_vd/dead_by_daylight.webm",
  figment: "under_price_vd/figment.webm",
  hacknet: "under_price_vd/hacknet.webm",
  "human-fall-flat": "under_price_vd/human_fall_flat.webm",
  "killing-floor-2": "under_price_vd/killing.webm",
  "the-elder-scrolls-v-skyrim": "under_price_vd/the_elder.webm",
  "total-war-warhammer-ii": "under_price_vd/total_war.webm",
};

const coverFolders = new Set([
  "popular_game",
  "up_coming",
  "new_on_difmark",
  "weekly_chart",
  "under_price",
]);

/** Match the game identity, including the same game in another home section. */
export function getGamePreviewVideo(coverImage: string) {
  try {
    const url = new URL(coverImage);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    const match = url.pathname.match(
      /^\/storage\/v1\/object\/public\/Image\/([^/]+)\/([^/]+)$/,
    );
    if (!match || !coverFolders.has(match[1].replace(/_large$/, "")))
      return undefined;
    const filename = decodeURIComponent(match[2]);
    if (filename.includes("/") || !/\.(?:jpe?g|png|webp|avif)$/i.test(filename))
      return undefined;
    const slug = filename
      .replace(/\.[^.]+$/, "")
      .replace(
        /[-_](?:pc|ps[345]|xbox[^_]*|switch)[-_]icon.*$|[-_]icon.*$/i,
        "",
      )
      .toLowerCase();
    const file = Object.hasOwn(previewFiles, slug)
      ? previewFiles[slug]
      : undefined;
    if (!file) return undefined;
    url.pathname = `/storage/v1/object/public/Image/${file}`;
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return undefined;
  }
}

/** Explicit product previews take priority over the shared Storage mapping. */
export function getHomepageGamePreviewVideo(game: {
  image_url: string;
  video_url?: string | null;
}) {
  return game.video_url || getGamePreviewVideo(game.image_url);
}
