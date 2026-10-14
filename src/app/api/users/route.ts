import { NextResponse } from "next/server";
import { MOCK_USERS } from "@/lib/users";

// List of seeded users for the "Sign in as" dropdown and the share picker.
export async function GET() {
  return NextResponse.json({ users: MOCK_USERS });
}
