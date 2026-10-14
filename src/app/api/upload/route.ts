import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getUserIdFromRequest } from "@/lib/currentUser";
import { validateUploadFile, isMarkdownFile } from "@/lib/fileValidation";
import { markdownToHtml, plainTextToHtml } from "@/lib/markdown";

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

  const { data, error } = await supabaseAdmin
    .from("documents")
    .insert({ title, content: { type: "html-import", html }, owner_id: userId })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ document: data }, { status: 201 });
}
