import { supabaseAdmin } from "./supabaseAdmin";
import { AccessDocument } from "./access";

export type DocumentRow = {
  id: string;
  title: string;
  content: unknown;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

/** Fetches a document plus the user_ids it's shared with, for access checks. */
export async function getDocumentWithShares(
  id: string
): Promise<{ doc: DocumentRow; access: AccessDocument } | null> {
  const { data: doc, error } = await supabaseAdmin
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !doc) return null;

  const { data: shares } = await supabaseAdmin
    .from("shares")
    .select("user_id")
    .eq("document_id", id);

  return {
    doc: doc as DocumentRow,
    access: {
      ownerId: doc.owner_id,
      sharedUserIds: (shares ?? []).map((s) => s.user_id as string),
    },
  };
}
