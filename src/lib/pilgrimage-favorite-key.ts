export type PilgrimageFavoriteKind = "site" | "route";

export type PilgrimageFavoriteRef = {
  kind: PilgrimageFavoriteKind;
  slug: string;
};

export function pilgrimageFavoriteKey(
  kind: PilgrimageFavoriteKind,
  slug: string,
): string {
  return `${kind}:${slug}`;
}
