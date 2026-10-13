// Temporary display dates from the reference mockup, not official release data.
// A date entered in the catalog always takes precedence.
const mockReleaseDates: Record<string, string> = {
  "warhammer 40000 dawn of war iv": "2026-12-03",
  "call of duty modern warfare 4": "2026-10-23",
  "fable xbox series": "2027-02-23",
  fable: "2027-02-23",
  "grand theft auto vi": "2026-11-19",
  "castlevania belmonts curse": "2026-10-15",
  "persona 4 revival": "2027-02-18",
  "tomb raider legacy of atlantis": "2027-02-12",
  "phantom blade zero": "2026-10-29",
};

export function getUpcomingReleaseDate(game: {
  title: string;
  release_date: string | null;
}): string | null {
  if (game.release_date) return game.release_date;
  const title = game.title.toLowerCase().trim().replace(/\s+/g, " ");
  return Object.hasOwn(mockReleaseDates, title) ? mockReleaseDates[title] : null;
}
