import { getDocumentById, getShareUserIds, DocumentRow } from "./db";
import { AccessDocument } from "./access";

export type { DocumentRow };

/** Fetches a document plus the user_ids it's shared with, for access checks. */
export async function getDocumentWithShares(
  id: string
): Promise<{ doc: DocumentRow; access: AccessDocument } | null> {
  const doc = await getDocumentById(id);
  if (!doc) return null;

  const sharedUserIds = await getShareUserIds(id);

  return {
    doc,
    access: { ownerId: doc.owner_id, sharedUserIds },
  };
}
