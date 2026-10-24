import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

export async function GET() {
  try {
    // Run simple lightweight probe
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: unknown) {
    logError({ path: "/api/health", error });

    // Strictly return { ok: false } without leaking error message or connection details
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
