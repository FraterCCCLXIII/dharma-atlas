import { NextResponse } from "next/server";
import { isValidCoord } from "@/lib/coords";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

type IpWhoResponse = {
  success?: boolean;
  latitude?: number;
  longitude?: number;
};

function isPublicIp(ip: string): boolean {
  if (!ip || ip === "unknown") return false;
  if (ip === "::1" || ip === "127.0.0.1") return false;
  if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("127.")) {
    return false;
  }
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return false;
  if (ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")) {
    return false;
  }
  return true;
}

export async function GET(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit({
    key: `geolocate:${ip}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!limited.allowed) return rateLimitResponse(limited.retryAfterMs);

  try {
    const url = isPublicIp(ip)
      ? `https://ipwho.is/${encodeURIComponent(ip)}`
      : "https://ipwho.is/";

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Lookup failed" }, { status: 502 });
    }

    const data = (await response.json()) as IpWhoResponse;
    if (data.success === false || !isValidCoord(data.latitude, data.longitude)) {
      return NextResponse.json({ error: "Location unavailable" }, { status: 404 });
    }

    return NextResponse.json({
      lat: Number(data.latitude),
      lng: Number(data.longitude),
      source: "ip",
    });
  } catch {
    return NextResponse.json({ error: "Lookup failed" }, { status: 502 });
  }
}
