import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;
  const userEmail = session.user.email;

  if (!userId && !userEmail) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: userId ? { id: userId } : { email: userEmail! },
  });

  if (!dbUser) {
    redirect("/login");
  }

  if (dbUser.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return { session, user: dbUser };
}
