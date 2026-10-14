import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getUserIdFromRequest } from "@/lib/currentUser";
import { getDocumentWithShares } from "@/lib/documents";
import { canAccessDocument, canManageDocument } from "@/lib/access";

// GET /api/documents/:id -> the document, if the user can access it
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const result = await getDocumentWithShares(params.id);
  if (!result) return NextResponse.json({ error: "Document not found." }, { status: 404 });

  if (!canAccessDocument(userId, result.access)) {
    return NextResponse.json({ error: "You don't have access to this document." }, { status: 403 });
  }

  const owner = result.doc.owner_id;
  return NextResponse.json({
    document: result.doc,
    isOwner: owner === userId,
    sharedUserIds: result.access.sharedUserIds,
  });
}

// PATCH /api/documents/:id -> update title and/or content (owner or shared user)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const result = await getDocumentWithShares(params.id);
  if (!result) return NextResponse.json({ error: "Document not found." }, { status: 404 });

  if (!canAccessDocument(userId, result.access)) {
    return NextResponse.json({ error: "You don't have access to this document." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};

  if (typeof body.title === "string") {
    const title = body.title.trim();
    if (!title) {
      return NextResponse.json({ error: "Title cannot be empty." }, { status: 400 });
    }
    updates.title = title;
  }

  if (body.content !== undefined) {
    updates.content = body.content;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("documents")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ document: data });
}

// DELETE /api/documents/:id -> owner only
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const result = await getDocumentWithShares(params.id);
  if (!result) return NextResponse.json({ error: "Document not found." }, { status: 404 });

  if (!canManageDocument(userId, result.access)) {
    return NextResponse.json({ error: "Only the owner can delete this document." }, { status: 403 });
  }

  const { error } = await supabaseAdmin.from("documents").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
