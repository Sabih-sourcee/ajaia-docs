// Pure, DB-free access-control logic so it can be unit tested without
// touching Supabase. API routes call this after fetching the document's
// owner_id and the list of user_ids it is shared with.

export type AccessDocument = {
  ownerId: string;
  sharedUserIds: string[];
};

/** Can this user view/edit the document (owner or shared-with)? */
export function canAccessDocument(userId: string | null | undefined, doc: AccessDocument): boolean {
  if (!userId) return false;
  if (userId === doc.ownerId) return true;
  return doc.sharedUserIds.includes(userId);
}

/** Only the owner may manage sharing (add/remove) or delete the document. */
export function canManageDocument(userId: string | null | undefined, doc: AccessDocument): boolean {
  if (!userId) return false;
  return userId === doc.ownerId;
}
