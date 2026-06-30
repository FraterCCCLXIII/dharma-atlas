import L from "leaflet";

/** Arrange `count` points in a ring around `center` (screen pixels, current zoom). */
export function stackSpiderfyPositions(
  map: L.Map,
  center: L.LatLngExpression,
  count: number,
): L.LatLng[] {
  const origin = map.latLngToLayerPoint(center);
  const radius = Math.min(64, 28 + count * 3);

  return Array.from({ length: count }, (_, index) => {
    const angle = (2 * Math.PI * index) / count - Math.PI / 2;
    const point = L.point(
      origin.x + radius * Math.cos(angle),
      origin.y + radius * Math.sin(angle),
    );
    return map.layerPointToLatLng(point);
  });
}
