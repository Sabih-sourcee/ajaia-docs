import { describe, it, expect } from "vitest";
import { canAccessDocument, canManageDocument } from "./access";

const doc = { ownerId: "owner-1", sharedUserIds: ["shared-1", "shared-2"] };

describe("canAccessDocument", () => {
  it("allows the owner", () => {
    expect(canAccessDocument("owner-1", doc)).toBe(true);
  });

  it("allows a shared user", () => {
    expect(canAccessDocument("shared-1", doc)).toBe(true);
  });

  it("denies a stranger", () => {
    expect(canAccessDocument("stranger-1", doc)).toBe(false);
  });

  it("denies when no user id is provided", () => {
    expect(canAccessDocument(null, doc)).toBe(false);
    expect(canAccessDocument(undefined, doc)).toBe(false);
  });
});

describe("canManageDocument", () => {
  it("allows only the owner to manage sharing", () => {
    expect(canManageDocument("owner-1", doc)).toBe(true);
    expect(canManageDocument("shared-1", doc)).toBe(false);
    expect(canManageDocument("stranger-1", doc)).toBe(false);
  });
});
