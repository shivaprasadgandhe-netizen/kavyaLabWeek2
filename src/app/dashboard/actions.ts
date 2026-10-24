"use server";

import { requireUser } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export interface DeleteAccountState {
  error?: string;
  success?: boolean;
}

export async function deleteOwnAccount(
  _prevState: DeleteAccountState,
  formData: FormData
): Promise<DeleteAccountState> {
  const { user } = await requireUser();

  const confirmationEmail = formData.get("confirmationEmail");
  if (typeof confirmationEmail !== "string") {
    return { error: "Confirmation email is required." };
  }

  const trimmed = confirmationEmail.trim().toLowerCase();
  const userEmail = (user.email || "").trim().toLowerCase();

  if (!trimmed || trimmed !== userEmail) {
    return { error: "The entered email address does not match your account email." };
  }

  try {
    await db.user.delete({
      where: { id: user.id },
    });
  } catch (error) {
    console.error("Error deleting user account:", error);
    return { error: "Failed to delete account. Please try again." };
  }

  redirect("/login");
}
