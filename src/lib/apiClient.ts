// Thin fetch wrapper that attaches the mocked x-user-id header.
export async function apiFetch(url: string, userId: string | null, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (userId) headers.set("x-user-id", userId);
  if (init.body && typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(url, { ...init, headers });
  return res;
}
