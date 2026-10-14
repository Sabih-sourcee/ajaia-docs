import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getUserIdFromRequest } from "@/lib/currentUser";

const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };

// GET /api/documents -> { owned: [...], shared: [...] } for the current user
export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: owned, error: ownedError } = await supabaseAdmin
    .from("documents")
    .select("id,title,created_at,updated_at,owner_id")
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false });

  if (ownedError) {
    return NextResponse.json({ error: ownedError.message }, { status: 500 });
  }

  const { data: shareRows, error: shareError } = await supabaseAdmin
    .from("shares")
    .select("document_id")
    .eq("user_id", userId);

  if (shareError) {
    return NextResponse.json({ error: shareError.message }, { status: 500 });
  }

  const sharedIds = (shareRows ?? []).map((r) => r.document_id as string);
  let shared: unknown[] = [];
  if (sharedIds.length > 0) {
    const { data, error } = await supabaseAdmin
      .from("documents")
      .select("id,title,created_at,updated_at,owner_id")
      .in("id", sharedIds)
      .order("updated_at", { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    shared = data ?? [];
  }

  return NextResponse.json({ owned: owned ?? [], shared });
}

// POST /api/documents -> creates a new empty document owned by the current user
export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const title = typeof body.title === "string" && body.title.trim() ? body.title.trim() : "Untitled document";
  const content = body.content ?? EMPTY_DOC;

  const { data, error } = await supabaseAdmin
    .from("documents")
    .insert({ title, content, owner_id: userId })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ document: data }, { status: 201 });
}
