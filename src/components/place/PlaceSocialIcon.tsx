import {
  FacebookLogo,
  InstagramLogo,
  LinkSimple,
  LinkedinLogo,
  TiktokLogo,
  XLogo,
  YoutubeLogo,
} from "@phosphor-icons/react";
import {
  getPlaceSocialPlatformDef,
  type PlaceSocialIcon as PlaceSocialIconName,
} from "@/lib/place-socials";

const ICONS: Record<
  PlaceSocialIconName,
  typeof YoutubeLogo
> = {
  youtube: YoutubeLogo,
  instagram: InstagramLogo,
  facebook: FacebookLogo,
  x: XLogo,
  tiktok: TiktokLogo,
  linkedin: LinkedinLogo,
  link: LinkSimple,
};

export function PlaceSocialIcon({
  platform,
  size = 18,
  className,
}: {
  platform: string;
  size?: number;
  className?: string;
}) {
  const def = getPlaceSocialPlatformDef(platform);
  const Icon = ICONS[def.icon] ?? LinkSimple;
  return (
    <Icon
      size={size}
      weight="bold"
      className={["text-brand", className].filter(Boolean).join(" ")}
    />
  );
}
