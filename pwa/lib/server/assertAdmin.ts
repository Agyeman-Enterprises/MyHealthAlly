import { getCurrentUser } from "@/lib/supabase/auth";

/**
 * Asserts that the current user is an admin.
 * Throws an error if not authenticated or not an admin.
 */
export async function assertAdmin(): Promise<void> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  if (user.role !== "admin") {
    throw new Error("Admin access required");
  }
}

