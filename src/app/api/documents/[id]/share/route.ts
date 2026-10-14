import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getUserIdFromRequest } from "@/lib/currentUser";
import { getDocumentWithShares } from "@/lib/documents";
import { canManageDocument } from "@/lib/access";

// POST /api/documents/:id/share -> { userId } adds a share (owner only)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const result = await getDocumentWithShares(params.id);
  if (!result) return NextResponse.json({ error: "Document not found." }, { status: 404 });

  if (!canManageDocument(userId, result.access)) {
    return NextResponse.json({ error: "Only the owner can share this document." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const targetUserId = body.userId as string | undefined;
  if (!targetUserId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }
  if (targetUserId === result.doc.owner_id) {
    return NextResponse.json({ error: "The owner already has access." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("shares")
    .upsert({ document_id: params.id, user_id: targetUserId }, { onConflict: "document_id,user_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true }, { status: 201 });
}

// DELETE /api/documents/:id/share -> { userId } removes a share (owner only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const result = await getDocumentWithShares(params.id);
  if (!result) return NextResponse.json({ error: "Document not found." }, { status: 404 });

  if (!canManageDocument(userId, result.access)) {
    return NextResponse.json({ error: "Only the owner can modify sharing." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const targetUserId = body.userId as string | undefined;
  if (!targetUserId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("shares")
    .delete()
    .eq("document_id", params.id)
    .eq("user_id", targetUserId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
