import { sql } from "@vercel/postgres";
import { randomUUID } from "crypto";

// Persistence layer backed by Vercel Postgres (Neon under the hood), a free
// tier that's provisioned and linked straight from the Vercel dashboard/CLI
// for this project — no separate database project/account needed.
//
// All functions here are the only place that talks to the database; API
// routes call these, and `src/lib/access.ts` stays DB-free and unit testable.

export type DocumentRow = {
  id: string;
  title: string;
  content: unknown;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type DocumentSummary = {
  id: string;
  title: string;
  updated_at: string;
  owner_id: string;
};

export async function getDocumentById(id: string): Promise<DocumentRow | null> {
  const { rows } = await sql<DocumentRow>`select * from documents where id = ${id}`;
  return rows[0] ?? null;
}

export async function getShareUserIds(documentId: string): Promise<string[]> {
  const { rows } = await sql<{ user_id: string }>`
    select user_id from shares where document_id = ${documentId}
  `;
  return rows.map((r: { user_id: string }) => r.user_id);
}

export async function listOwnedDocuments(ownerId: string): Promise<DocumentSummary[]> {
  const { rows } = await sql<DocumentSummary>`
    select id, title, updated_at, owner_id from documents
    where owner_id = ${ownerId}
    order by updated_at desc
  `;
  return rows;
}

export async function listSharedDocuments(userId: string): Promise<DocumentSummary[]> {
  const { rows } = await sql<DocumentSummary>`
    select d.id, d.title, d.updated_at, d.owner_id
    from documents d
    join shares s on s.document_id = d.id
    where s.user_id = ${userId}
    order by d.updated_at desc
  `;
  return rows;
}

export async function createDocument(params: {
  title: string;
  content: unknown;
  ownerId: string;
}): Promise<DocumentRow> {
  const id = randomUUID();
  const contentJson = JSON.stringify(params.content);
  const { rows } = await sql<DocumentRow>`
    insert into documents (id, title, content, owner_id)
    values (${id}, ${params.title}, ${contentJson}::jsonb, ${params.ownerId})
    returning *
  `;
  return rows[0];
}

export async function updateDocument(
  id: string,
  updates: { title?: string; content?: unknown }
): Promise<DocumentRow | null> {
  if (updates.title !== undefined && updates.content !== undefined) {
    const contentJson = JSON.stringify(updates.content);
    const { rows } = await sql<DocumentRow>`
      update documents
      set title = ${updates.title}, content = ${contentJson}::jsonb
      where id = ${id}
      returning *
    `;
    return rows[0] ?? null;
  }
  if (updates.title !== undefined) {
    const { rows } = await sql<DocumentRow>`
      update documents set title = ${updates.title} where id = ${id} returning *
    `;
    return rows[0] ?? null;
  }
  if (updates.content !== undefined) {
    const contentJson = JSON.stringify(updates.content);
    const { rows } = await sql<DocumentRow>`
      update documents set content = ${contentJson}::jsonb where id = ${id} returning *
    `;
    return rows[0] ?? null;
  }
  return getDocumentById(id);
}

export async function deleteDocument(id: string): Promise<void> {
  await sql`delete from documents where id = ${id}`;
}

export async function addShare(documentId: string, userId: string): Promise<void> {
  await sql`
    insert into shares (document_id, user_id)
    values (${documentId}, ${userId})
    on conflict (document_id, user_id) do nothing
  `;
}

export async function removeShare(documentId: string, userId: string): Promise<void> {
  await sql`
    delete from shares where document_id = ${documentId} and user_id = ${userId}
  `;
}
