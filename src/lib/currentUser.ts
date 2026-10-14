import { NextRequest } from "next/server";

/** Reads the mocked-auth header sent by the browser on every API request. */
export function getUserIdFromRequest(req: NextRequest): string | null {
  return req.headers.get("x-user-id");
}
