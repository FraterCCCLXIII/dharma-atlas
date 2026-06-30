export function isValidCoord(lat: unknown, lng: unknown): boolean {
  const la = Number(lat);
  const ln = Number(lng);
  return (
    Number.isFinite(la) &&
    Number.isFinite(ln) &&
    Math.abs(la) <= 90 &&
    Math.abs(ln) <= 180
  );
}

export function toLatLng(lat: unknown, lng: unknown): [number, number] | null {
  const la = Number(lat);
  const ln = Number(lng);
  return isValidCoord(la, ln) ? [la, ln] : null;
}
