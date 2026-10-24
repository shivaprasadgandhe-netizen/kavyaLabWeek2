import { NextResponse } from "next/server";
import { db, withRetry } from "@/lib/db";

export async function GET() {
  try {
    // Run simple lightweight probe with retry for Neon cold starts
    await withRetry(() => db.$queryRaw`SELECT 1`);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    // Strictly return { ok: false } with 503 and no error details leaked
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
