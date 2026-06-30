export const USER_AGENT =
  "DharmaAtlas/1.0 (https://github.com/FraterCCCLXIII/dharma-atlas; contact@dharma-atlas.org)";

let lastRequestAt = 0;
const MIN_INTERVAL_MS = 150;

async function throttle() {
  const now = Date.now();
  const wait = lastRequestAt + MIN_INTERVAL_MS - now;
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestAt = Date.now();
}

export async function fetchJson<T>(url: string, retries = 2): Promise<T | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    await throttle();
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      });
      if (res.status === 404) return null;
      if (res.status === 429 || res.status >= 500) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        continue;
      }
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  return null;
}
