import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/currentUser";
import { listOwnedDocuments, listSharedDocuments, createDocument } from "@/lib/db";

const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };

// GET /api/documents -> { owned: [...], shared: [...] } for the current user
export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  try {
    const [owned, shared] = await Promise.all([
      listOwnedDocuments(userId),
      listSharedDocuments(userId),
    ]);
    return NextResponse.json({ owned, shared });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
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

  try {
    const document = await createDocument({ title, content, ownerId: userId });
    return NextResponse.json({ document }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
