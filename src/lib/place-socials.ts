export const PLACE_SOCIAL_PLATFORMS = [
  "youtube",
  "instagram",
  "facebook",
  "x",
  "tiktok",
  "linkedin",
  "other",
] as const;

export type PlaceSocialPlatform = (typeof PLACE_SOCIAL_PLATFORMS)[number];

export type PlaceSocialIcon =
  | "youtube"
  | "instagram"
  | "facebook"
  | "x"
  | "tiktok"
  | "linkedin"
  | "link";

export interface PlaceSocialPlatformDef {
  id: PlaceSocialPlatform;
  label: string;
  icon: PlaceSocialIcon;
  placeholder: string;
}

/** Curated social platforms for place contact links. */
export const PLACE_SOCIAL_PLATFORM_DEFS: PlaceSocialPlatformDef[] = [
  {
    id: "youtube",
    label: "YouTube",
    icon: "youtube",
    placeholder: "https://youtube.com/@…",
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: "instagram",
    placeholder: "https://instagram.com/…",
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: "facebook",
    placeholder: "https://facebook.com/…",
  },
  {
    id: "x",
    label: "X",
    icon: "x",
    placeholder: "https://x.com/…",
  },
  {
    id: "tiktok",
    label: "TikTok",
    icon: "tiktok",
    placeholder: "https://tiktok.com/@…",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: "linkedin",
    placeholder: "https://linkedin.com/…",
  },
  {
    id: "other",
    label: "Other",
    icon: "link",
    placeholder: "https://…",
  },
];

const PLATFORM_BY_ID = new Map(
  PLACE_SOCIAL_PLATFORM_DEFS.map((def) => [def.id, def]),
);

export function isPlaceSocialPlatform(value: string): value is PlaceSocialPlatform {
  return PLACE_SOCIAL_PLATFORMS.includes(value as PlaceSocialPlatform);
}

export function getPlaceSocialPlatformDef(
  platform: string,
): PlaceSocialPlatformDef {
  if (isPlaceSocialPlatform(platform)) {
    return PLATFORM_BY_ID.get(platform) ?? PLACE_SOCIAL_PLATFORM_DEFS[6]!;
  }
  return PLACE_SOCIAL_PLATFORM_DEFS[6]!;
}

export function placeSocialDisplayLabel(input: {
  platform: string;
  label?: string | null;
}): string {
  const custom = input.label?.trim();
  if (input.platform === "other" && custom) return custom;
  return getPlaceSocialPlatformDef(input.platform).label;
}
