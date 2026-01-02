import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/server/assertAdmin";
import { supabaseService } from "@/lib/supabase/service";

export async function POST(req: Request) {
  try {
    await assertAdmin();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 }
    );
  }

  if (!supabaseService) {
    return NextResponse.json(
      { error: "Supabase service client not configured" },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json(
      { error: "Missing required fields: id, status" },
      { status: 400 }
    );
  }

  if (status !== "published" && status !== "hidden" && status !== "archived") {
    return NextResponse.json(
      { error: "Invalid status. Must be 'published', 'hidden', or 'archived'" },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabaseService
    .from("content_modules")
    .update({
      status,
      updated_at: new Date().toISOString(),
      // Set publish_at if publishing for the first time
      ...(status === "published" ? { publish_at: new Date().toISOString() } : {}),
    })
    .eq("id", id);

  if (updateError) {
    console.error("Error updating content module:", updateError);
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

