import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { checkExportRateLimit, getClientIp, hashIp } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function GET() {
  const { user } = await requireUser();

  // Rate limiting: 5 exports per user per hour
  const { allowed, retryAfterSeconds } = await checkExportRateLimit(user.id);
  if (!allowed) {
    return new Response(
      JSON.stringify({
        error: "Export rate limit exceeded. You can request up to 5 exports per hour.",
      }),
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  // Load user-controlled data: profile, accounts (providers only, no tokens),
  // sessions (times & user agents only, no tokens), and security events
  const [profile, accounts, sessions, securityEvents] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastSignedInAt: true,
      },
    }),
    prisma.account.findMany({
      where: { userId: user.id },
      select: {
        provider: true,
        type: true,
        createdAt: true,
      },
    }),
    prisma.session.findMany({
      where: { userId: user.id },
      select: {
        createdAt: true,
        expires: true,
        userAgent: true,
      },
    }),
    prisma.securityEvent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        type: true,
        createdAt: true,
        userAgent: true,
      },
    }),
  ]);

  // Record DATA_EXPORTED security event
  try {
    const reqHeaders = await headers();
    const rawIp = getClientIp(reqHeaders);
    const ipHash = hashIp(rawIp);
    const userAgent = (reqHeaders.get("user-agent") || "").slice(0, 255) || null;

    await prisma.securityEvent.create({
      data: {
        userId: user.id,
        type: "DATA_EXPORTED",
        ipHash,
        userAgent,
      },
    });
  } catch (err) {
    console.error("Error recording DATA_EXPORTED event:", err);
  }

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    profile,
    connectedAccounts: accounts,
    activeSessions: sessions,
    securityEventsHistory: securityEvents,
  };

  return new Response(JSON.stringify(exportPayload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="kavya-labs-account-data.json"',
      "Cache-Control": "no-store",
    },
  });
}
