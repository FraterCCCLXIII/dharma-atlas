export function isLocalTraditionImagePath(webPath: string): boolean {
  return webPath.startsWith("/traditions/") && !webPath.includes("..");
}
