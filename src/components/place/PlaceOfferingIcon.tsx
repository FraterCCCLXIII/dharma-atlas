import {
  Bed,
  BookOpen,
  Books,
  Broadcast,
  Car,
  ChatsCircle,
  FlowerLotus,
  ForkKnife,
  HandsPraying,
  Heart,
  House,
  MoonStars,
  PersonSimpleTaiChi,
  PersonSimpleWalk,
  Sparkle,
  UsersThree,
  Wheelchair,
} from "@phosphor-icons/react";
import type { PlaceOfferingIcon as OfferingIconId } from "@/lib/place-offerings";

const ICONS: Record<
  OfferingIconId,
  React.ComponentType<{ size?: number; weight?: "duotone" | "regular" | "bold"; className?: string }>
> = {
  lotus: FlowerLotus,
  walk: PersonSimpleWalk,
  music: HandsPraying,
  chats: ChatsCircle,
  book: BookOpen,
  moon: MoonStars,
  sparkle: Sparkle,
  broadcast: Broadcast,
  house: House,
  users: UsersThree,
  fork: ForkKnife,
  bed: Bed,
  books: Books,
  car: Car,
  wheelchair: Wheelchair,
  heart: Heart,
  quiet: MoonStars,
  person: PersonSimpleTaiChi,
};

export function PlaceOfferingIcon({
  name,
  className,
}: {
  name: OfferingIconId;
  className?: string;
}) {
  const Icon = ICONS[name] ?? FlowerLotus;
  return <Icon size={24} weight="duotone" className={className} aria-hidden />;
}
