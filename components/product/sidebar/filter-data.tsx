import {
  SiEa,
  SiEpicgames,
  SiGogdotcom,
  SiRockstargames,
  SiSteam,
  SiUbisoft,
} from "react-icons/si";
import { FaGlobe, FaWindows } from "react-icons/fa";
import { MdComputer, MdUpcoming } from "react-icons/md";
import { BsKeyFill } from "react-icons/bs";
import { BsXbox } from "react-icons/bs";

export interface FilterSubItem {
  id: string;
  label: string;
  count?: number;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface FilterItem {
  id: string;
  label: string;
  subItems: FilterSubItem[];
}

export const PRODUCT_TYPE_FILTER_ITEMS: FilterSubItem[] = [
  { id: "game-keys", label: "Game Keys", count: 13933, icon: <BsKeyFill /> },
  {
    id: "console-games",
    label: "Console Games",
    count: 11707,
    icon: <BsXbox />,
  },
  { id: "pc-games", label: "PC Games", count: 9668, icon: <MdComputer /> },
  { id: "mobile", label: "Mobile", count: 110, icon: <MdComputer /> },
  {
    id: "game-currency",
    label: "Game Currency",
    count: 214,
    icon: <BsKeyFill />,
  },
  {
    id: "game-accounts",
    label: "Game Accounts",
    count: 146,
    icon: <BsKeyFill />,
  },
  { id: "game-items", label: "Game Items", count: 143, icon: <BsKeyFill /> },
  {
    id: "power-leveling",
    label: "Power Leveling",
    count: 141,
    icon: <BsKeyFill />,
  },
  { id: "software", label: "Software", count: 973, icon: <FaWindows /> },
  { id: "gift-cards", label: "Gift Cards", count: 3541, icon: <BsKeyFill /> },
  { id: "game-cards", label: "Game Cards", count: 1261, icon: <BsKeyFill /> },
  { id: "steam", label: "Steam", count: 15406, icon: <SiSteam /> },
  {
    id: "dlc",
    label: "DLC",
    count: 5321,
    icon: <span className="text-[9px] font-bold">DLC</span>,
  },
  { id: "upcoming", label: "Upcoming", count: 1884, icon: <MdUpcoming /> },
  { id: "gog", label: "GOG", count: 277, icon: <SiGogdotcom /> },
  { id: "ea", label: "Electronic arts", count: 191, icon: <SiEa /> },
  { id: "ubisoft", label: "Ubisoft", count: 166, icon: <SiUbisoft /> },
  { id: "epic", label: "Epic Games", count: 79, icon: <SiEpicgames /> },
  { id: "random-keys", label: "Random Keys", count: 31, icon: <BsKeyFill /> },
  {
    id: "microsoft",
    label: "Microsoft",
    count: 21,
    icon: <FaWindows />,
  },
];

export const PLATFORM_FILTER_ITEMS: FilterSubItem[] = [
  { id: "pc", label: "PC", icon: <MdComputer /> },
  { id: "ps5", label: "PlayStation 5", icon: <span>PS5</span> },
  { id: "ps4", label: "PlayStation 4", icon: <span>PS4</span> },
  { id: "xbox-series-x", label: "Xbox Series X/S", icon: <BsXbox /> },
  { id: "xbox-one", label: "Xbox One", icon: <BsXbox /> },
  { id: "nintendo-switch", label: "Nintendo Switch", icon: <span>N</span> },
  { id: "steam", label: "Steam", count: 15205, icon: <SiSteam /> },
  {
    id: "official-website",
    label: "Official website",
    count: 197,
    icon: <MdComputer />,
  },
  { id: "gog", label: "GOG", count: 182, icon: <SiGogdotcom /> },
  { id: "epic", label: "Epic Games", count: 67, icon: <SiEpicgames /> },
  { id: "ea", label: "Electronic arts", count: 58, icon: <SiEa /> },
  { id: "ubisoft", label: "Ubisoft", count: 45, icon: <SiUbisoft /> },
  { id: "rockstar", label: "Rockstar", count: 17, icon: <SiRockstargames /> },
  { id: "bethesda", label: "Bethesda", count: 6, icon: <span>B</span> },
  { id: "battle-net", label: "Battle.Net", count: 18, icon: <span>BN</span> },
  {
    id: "playstation",
    label: "Playstation",
    count: 354,
    icon: <span>PS</span>,
  },
  {
    id: "nintendo",
    label: "Nintendo Switch",
    count: 243,
    icon: <span>N</span>,
  },
  { id: "ios", label: "iOS", count: 54, icon: <span>iOS</span> },
  { id: "android", label: "Android", count: 56, icon: <span>AN</span> },
  {
    id: "windows-store",
    label: "Windows Store",
    count: 277,
    icon: <FaWindows />,
  },
  { id: "microsoft", label: "Microsoft", count: 42, icon: <FaWindows /> },
  { id: "xbox-live", label: "Xbox Live", count: 9, icon: <BsXbox /> },
  {
    id: "giants",
    label: "Giants",
    count: 9,
    icon: <SiRockstargames />,
    disabled: true,
  },
];

export const REGION_FILTER_ITEMS: FilterSubItem[] = [
  { id: "global", label: "Global", count: 11282, icon: <FaGlobe /> },
  { id: "ru-cis", label: "RU/CIS", count: 1807, icon: <span>RU</span> },
  { id: "europe", label: "Europe", count: 1329, icon: <span>EU</span> },
  { id: "row", label: "ROW", count: 1227, icon: <FaGlobe /> },
  { id: "russia", label: "Russia", count: 517, icon: <span>RU</span> },
  {
    id: "north-america",
    label: "North America",
    count: 130,
    icon: <FaGlobe />,
  },
  { id: "latin-america", label: "Latin America", count: 91, icon: <FaGlobe /> },
  {
    id: "united-states",
    label: "United States",
    count: 79,
    icon: <span>US</span>,
  },
  {
    id: "turkey-india",
    label: "Turkey/India",
    count: 68,
    icon: <FaGlobe />,
    disabled: true,
  },
];

export const OTHER_TYPE_FILTER_ITEMS: FilterSubItem[] = [
  { id: "other-dlc", label: "DLC", count: 3660 },
  { id: "pre-order", label: "Pre-order", count: 28 },
  { id: "bundle", label: "Bundle", count: 0, disabled: true },
  { id: "pack", label: "Pack", count: 0, disabled: true },
];

export const PRODUCT_TYPES_DATA: FilterItem[] = [
  {
    id: "product-type",
    label: "Product type",
    subItems: PRODUCT_TYPE_FILTER_ITEMS,
  },
  {
    id: "platform",
    label: "Platform",
    subItems: PLATFORM_FILTER_ITEMS,
  },
  {
    id: "region",
    label: "Region",
    subItems: REGION_FILTER_ITEMS,
  },
  {
    id: "other-types",
    label: "Other types",
    subItems: OTHER_TYPE_FILTER_ITEMS,
  },
];
