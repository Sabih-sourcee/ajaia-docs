import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/currentUser";
import { validateUploadFile, isMarkdownFile } from "@/lib/fileValidation";
import { markdownToHtml, plainTextToHtml } from "@/lib/markdown";
import { createDocument } from "@/lib/db";

// POST /api/upload (multipart/form-data, field "file") -> creates a new
// document from a .txt or .md file, owned by the current user.
export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const validation = validateUploadFile(file.name, file.size);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const text = await file.text();
  const html = isMarkdownFile(file.name) ? markdownToHtml(text) : plainTextToHtml(text);

  const title = file.name.replace(/\.(txt|md)$/i, "") || "Imported document";

  try {
    const document = await createDocument({
      title,
      content: { type: "html-import", html },
      ownerId: userId,
    });
    return NextResponse.json({ document }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
