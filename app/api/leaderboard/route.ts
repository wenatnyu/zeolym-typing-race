import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const className = searchParams.get("class")?.trim();

    let query = supabaseAdmin
      .from("typing_results")
      .select(
        "id, name, class_name, signature_html, text_id, wpm, accuracy, time_seconds, correct_chars, total_chars, created_at",
      )
      .order("wpm", { ascending: false })
      .order("accuracy", { ascending: false })
      .order("time_seconds", { ascending: true })
      .limit(100);

    if (className) {
      query = query.eq("class_name", className);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ results: data ?? [] });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}