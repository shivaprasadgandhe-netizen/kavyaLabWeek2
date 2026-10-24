import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export const prisma = db;

/**
 * Handles Neon cold starts and connection drops by retrying a query once
 * if a connection closed/timeout error occurs.
 */
export async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const isConnectionError =
      errorMsg.includes("Closed") ||
      errorMsg.includes("connection pool") ||
      errorMsg.includes("Can't reach database server") ||
      errorMsg.includes("Connection lost") ||
      errorMsg.includes("ECONNRESET");

    if (isConnectionError) {
      // Short delay for serverless wake-up, then retry once
      await new Promise((resolve) => setTimeout(resolve, 300));
      return await operation();
    }
    throw error;
  }
}
