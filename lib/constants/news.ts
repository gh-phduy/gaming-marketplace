export interface NewsArticleSection {
  heading: string;
  paragraphs: string[];
}

export interface NewsArticle {
  slug: string;
  image: string;
  timeAgo: string;
  title: string;
  excerpt: string;
  views: number;
  content: NewsArticleSection[];
}

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    slug: "lego-batman-legacy-of-the-dark-knight-feels-like-the-first-real-step-forward-for-lego-games",
    image: "/bg-hero1.webp",
    timeAgo: "22 Hours Ago",
    title:
      "LEGO Batman: Legacy of the Dark Knight Feels Like the First Real Step Forward for LEGO Games",
    excerpt:
      "LEGO Batman: Legacy of the Dark Knight enters full release on May 22, 2026 for PC, PlayStation 5, Xbox Series X/S, and Nintendo Switch 2.",
    views: 53,
    content: [
      {
        heading: "Gotham Is Built Around Movement This Time",
        paragraphs: [
          "One of the biggest differences is how the game handles Gotham itself. Older LEGO titles usually treated open worlds as oversized hubs filled with collectibles and side activities that blurred together after a while. Here, the city feels more structured. Roads, rooftops, and districts are designed around movement instead of just scale, which makes exploring Gotham far less repetitive.",
          "That change is where the Arkham influence becomes noticeable. Batman moves faster, rooftop navigation feels smoother, and stealth sections finally have enough mechanics to stay interesting beyond the first hour.",
        ],
      },
      {
        heading: "The Open World Finally Has Better Pacing",
        paragraphs: [
          "Legacy of the Dark Knight also avoids one of the series' biggest problems: overload. Recent LEGO games often buried players under collectibles, markers, currencies, and side systems until the entire experience started feeling like a checklist.",
          "There is still plenty to collect, but side content appears more naturally and missions are shorter and better paced. The game wastes less time between major story beats, which helps Gotham feel active without exhausting the player.",
        ],
      },
      {
        heading: "A Rare Case Where More Focused Actually Helps",
        paragraphs: [
          "Technically, the game arrives in solid condition across all major platforms. Performance on current-gen consoles has been stable, Steam Deck support looks strong, and PC players are reporting far fewer issues than expected for a modern multiplatform release.",
          "What makes Legacy of the Dark Knight work is that it stops trying to constantly scale upward. Instead of making the world bigger or adding another hundred playable characters, TT Games focuses on improving the structure underneath everything.",
        ],
      },
    ],
  },
  {
    slug: "forza-horizon-6-finally-lands-in-japan-and-asking-players-to-actually-brake",
    image: "/hero-slide-2.webp",
    timeAgo: "2 Days Ago",
    title:
      "Forza Horizon 6 Finally Lands in Japan and Asking Players to Actually Brake",
    excerpt:
      "Forza Horizon 6 launched on May 19, 2026 for PC and Xbox Series X/S, with a PlayStation 5 release planned later this year.",
    views: 403,
    content: [
      {
        heading: "Japan Changes the Rhythm of the Drive",
        paragraphs: [
          "The new map is less about giant empty speed traps and more about roads that ask for attention. Mountain passes, compact city routes, and wet coastal highways all reward players who actually read the road before throwing the car into a corner.",
          "It is still unmistakably Horizon, but the festival energy finally has a setting dense enough to make every short drive feel different.",
        ],
      },
      {
        heading: "Progression Feels Less Automatic",
        paragraphs: [
          "Playground has adjusted the early game so cars arrive more deliberately. The reward flow is still generous, but the first several hours now give each new vehicle room to matter instead of burying players under a garage full of unused icons.",
          "That restraint helps tuning and car choice feel relevant again, especially in street races and seasonal championships.",
        ],
      },
      {
        heading: "A Strong Launch With Familiar Edges",
        paragraphs: [
          "The PC version is polished and scalable, while the Xbox Series X mode offers a strong balance between image quality and responsiveness. Server-side events have had a few crowded launch-day hiccups, but the core driving experience is already in good shape.",
        ],
      },
    ],
  },
  {
    slug: "subnautica-2-enters-early-access-with-5-million-wishlists-and-unreal-engine-5",
    image: "/hero-slide-3.webp",
    timeAgo: "7 Days Ago",
    title:
      "Subnautica 2 enters Early Access with 5 million wishlists and Unreal Engine 5",
    excerpt:
      "Subnautica 2 hit Early Access on May 12, 2026, and the Steam charts confirm that 5 million people are comfortable with being eaten by giant fish.",
    views: 887,
    content: [
      {
        heading: "A Familiar Fear With Sharper Teeth",
        paragraphs: [
          "The sequel keeps the slow pressure that made the first game memorable. Oxygen, darkness, and depth still do most of the work, but Unreal Engine 5 gives every reef and trench a thicker sense of scale.",
          "Early biomes are brighter and more readable, while the deeper areas quickly remind players that this is still a survival game built around hesitation.",
        ],
      },
      {
        heading: "Co-op Is the Biggest Risk",
        paragraphs: [
          "Adding cooperative play changes the mood. Exploration is less lonely, but smart encounter design keeps the ocean from becoming too comfortable. Creatures react more aggressively to groups, and resource pressure increases when multiple players push into the same region.",
        ],
      },
      {
        heading: "Early Access Starts Strong",
        paragraphs: [
          "There are missing systems and rough edges, as expected, but the foundation feels stable. The most promising sign is that Subnautica 2 already understands what should stay mysterious and what should become easier to manage.",
        ],
      },
    ],
  },
  {
    slug: "directive-8020-supermassive-trades-qte-movies-for-active-survival-horror",
    image: "/bg-hero4.webp",
    timeAgo: "9 Days Ago",
    title:
      "Directive 8020: Supermassive Trades QTE Movies for Active Survival Horror",
    excerpt:
      "Supermassive Games has officially abandoned the fixed-camera format of their previous anthology to embrace manual survival mechanics in Directive 8020.",
    views: 921,
    content: [
      {
        heading: "The Ship Is More Than a Stage",
        paragraphs: [
          "Directive 8020 takes place almost entirely aboard the Cassiopeia, a deep-space ship that becomes less reliable with every chapter. Instead of moving players from scene to scene, the game lets them revisit damaged corridors, reroute power, and manage scarce tools.",
          "That structure gives the horror more texture. The fear is not just about who survives a scene, but whether you prepared badly three rooms earlier.",
        ],
      },
      {
        heading: "Choices Still Matter, But So Does Execution",
        paragraphs: [
          "Supermassive has not dropped branching choices. Dialogue, trust, and character decisions still shape the story, but moment-to-moment play has more weight now. A poor stealth route or missed resource can matter as much as a dramatic conversation option.",
        ],
      },
      {
        heading: "A Promising Shift for the Studio",
        paragraphs: [
          "The result is less like an interactive film and more like a compact survival horror game with a branching narrative spine. It is a risky move, but it gives the studio a path forward that feels fresher than another anthology chapter.",
        ],
      },
    ],
  },
  {
    slug: "heroes-of-might-and-magic-olden-era-hits-41k-peak-with-92-percent-positive-rating",
    image: "/bg-hero2.webp",
    timeAgo: "20 Days Ago",
    title:
      "Heroes of Might and Magic: Olden Era Hits 41K Peak with 92% Positive Rating",
    excerpt:
      "The launch of Heroes of Might and Magic: Olden Era suggests that Ubisoft has finally realized the series works best when it respects the board-game pace.",
    views: 1240,
    content: [
      {
        heading: "A Classic Loop Returns",
        paragraphs: [
          "Olden Era leans back into scouting, town management, and turn pressure instead of trying to modernize every corner of the formula. The result feels deliberately old fashioned in the best way.",
          "Campaign maps are smaller than some expected, but they are packed with meaningful choices that keep every turn moving.",
        ],
      },
      {
        heading: "Players Are Rewarding Restraint",
        paragraphs: [
          "The strong Steam reception comes from a clear design promise: this is not a reboot trying to chase a different audience. It is a polished strategy game for people who still enjoy reading a map before making a move.",
        ],
      },
    ],
  },
  {
    slug: "007-first-lights-campaign-length-how-io-interactive-is-rebuilding-bond",
    image: "/hero-slide-4.webp",
    timeAgo: "17 Days Ago",
    title:
      "007 First Light's Campaign Length: How IO Interactive Is Rebuilding Bond",
    excerpt:
      "The team at IO Interactive has spent over a decade perfecting the art of the silent assassin. Their Bond game appears to borrow that confidence.",
    views: 1763,
    content: [
      {
        heading: "Bond Gets a Sandbox",
        paragraphs: [
          "First Light is not trying to turn James Bond into Agent 47, but IO's fingerprints are obvious. Missions offer social stealth, gadgets, disguises, and multiple exits, giving Bond room to improvise without losing cinematic momentum.",
        ],
      },
      {
        heading: "A Measured Campaign",
        paragraphs: [
          "The studio is targeting a focused campaign with replayable mission layers rather than a bloated open world. That choice fits Bond better than another map full of unrelated activities.",
        ],
      },
    ],
  },
  {
    slug: "stranger-than-heaven-brings-50-years-of-crime-and-snoop-dogg-to-ps5-and-xbox",
    image: "/bg1.webp",
    timeAgo: "14 Days Ago",
    title:
      "Stranger Than Heaven Brings 50 Years of Crime and Snoop Dogg to PS5 and Xbox",
    excerpt:
      "The recent Xbox Presents showcase gave us our first deep look at Stranger Than Heaven, a project that blends crime drama with decades of shifting culture.",
    views: 689,
    content: [
      {
        heading: "A Crime Story Across Eras",
        paragraphs: [
          "Stranger Than Heaven follows one city across fifty years of changing alliances, music, fashion, and street-level politics. The most interesting promise is not scale, but consequence.",
          "Characters age, districts change hands, and missions return to old locations with new context.",
        ],
      },
      {
        heading: "Style Has to Support the Story",
        paragraphs: [
          "The celebrity cameo grabbed attention, but the stronger material is in the period detail. If the final game can make each decade feel playable instead of decorative, it could become more than a showcase trailer.",
        ],
      },
    ],
  },
  {
    slug: "battlefield-6-season-one-roadmap-adds-night-maps-and-smaller-objectives",
    image: "/battlefield_6.jpg",
    timeAgo: "25 Days Ago",
    title:
      "Battlefield 6 Season One Roadmap Adds Night Maps and Smaller Objectives",
    excerpt:
      "DICE is adjusting Battlefield 6's first season around tighter combat spaces, night variants, and a new objective chain built for coordinated squads.",
    views: 2148,
    content: [
      {
        heading: "The First Season Pulls Combat Closer",
        paragraphs: [
          "Season One focuses on maps with shorter sightlines and clearer squad routes. That is a smart reaction to launch feedback, where some of the largest spaces made infantry pushes feel disconnected from the main battle.",
        ],
      },
      {
        heading: "Night Variants Need More Than Darkness",
        paragraphs: [
          "The new night maps look dramatic, but visibility balance will decide whether they become favorites or rotation skips. DICE says gadget readability and vehicle silhouettes have been tuned separately for these variants.",
        ],
      },
    ],
  },
];

export const LATEST_NEWS = NEWS_ARTICLES.slice(0, 4);

export const NEWS_ROUTE = "/lastestnews";

export function getNewsArticleHref(slug: string) {
  return `${NEWS_ROUTE}/${encodeURIComponent(slug)}`;
}

export function getNewsArticleBySlug(slug: string) {
  return NEWS_ARTICLES.find((article) => article.slug === slug);
}
