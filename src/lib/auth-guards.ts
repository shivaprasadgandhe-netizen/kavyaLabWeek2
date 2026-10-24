import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

/**
 * Server-side guard ensuring an active, non-suspended user session.
 * Reads session user ID, loads the user record from the database (id, role, status),
 * deletes sessions and redirects to /login?error=suspended if user is suspended,
 * and returns the authenticated database user.
 */
export async function requireUser() {
  const session = await auth();

  const userId = session?.user?.id;
  const userEmail = session?.user?.email;

  if (!userId && !userEmail) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: userId ? { id: userId } : { email: userEmail! },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      image: true,
      createdAt: true,
      lastSignedInAt: true,
      suspendedAt: true,
      suspendedReason: true,
    },
  });

  if (!dbUser) {
    redirect("/login");
  }

  // If status is SUSPENDED, delete all active sessions immediately and redirect
  if (dbUser.status === "SUSPENDED") {
    try {
      await prisma.session.deleteMany({
        where: { userId: dbUser.id },
      });
    } catch (err) {
      console.error("Error clearing sessions for suspended user:", err);
    }
    redirect("/login?error=suspended");
  }

  return { session, user: dbUser };
}

/**
 * Server-side guard ensuring an active administrator session.
 * Calls requireUser(), then requires role === "ADMIN".
 * Non-admins are redirected to /dashboard.
 */
export async function requireAdmin() {
  const { session, user } = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return { session, user };
}
