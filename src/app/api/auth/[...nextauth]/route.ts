import { handlers } from "@/auth";
import { checkSignInRateLimit, getClientIp } from "@/lib/rate-limit";
import { NextRequest } from "next/server";

export const { GET } = handlers;

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req.headers);
  const { allowed, retryAfterSeconds } = await checkSignInRateLimit(clientIp);

  if (!allowed) {
    return new Response(
      JSON.stringify({
        error: "Too many sign-in requests. Please try again later.",
      }),
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
          "Content-Type": "application/json",
        },
      }
    );
  }

  return handlers.POST(req);
}
