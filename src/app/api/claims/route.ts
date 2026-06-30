import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { createClaim } from "@/lib/data/claims";
import { notifyNewClaim } from "@/lib/email";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getMembership } from "@/lib/data/memberships";
import { createClaimSchema } from "@/lib/validations/claim";

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit({ key: `claims:${ip}`, limit: 10 });
  if (!limited.allowed) return rateLimitResponse(limited.retryAfterMs);

  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sign in to claim a location." }, { status: 401 });
    }

    const body = await request.json();
    const data = createClaimSchema.parse(body);

    if (data.placeId) {
      const existing = await getMembership(session.user.id, data.placeId);
      if (existing) {
        return NextResponse.json(
          { error: "You already manage this location." },
          { status: 409 },
        );
      }
    }

    await createClaim({
      userId: session.user.id,
      entityType: data.entityType,
      placeId: data.placeId,
      teacherSlug: data.teacherSlug,
      placeName: data.placeName,
      listingUrl: data.listingUrl || undefined,
      affiliationRole: data.affiliationRole,
      message: data.message,
    });

    await notifyNewClaim({
      placeName: data.placeName,
      userEmail: session.user.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid claim request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
