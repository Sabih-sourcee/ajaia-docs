"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { MOCK_USERS, MockUser } from "@/lib/users";

const STORAGE_KEY = "ajaia-docs-mock-user-id";

type UserContextValue = {
  userId: string | null;
  user: MockUser | undefined;
  users: MockUser[];
  setUserId: (id: string) => void;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserIdState] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setUserIdState(stored || MOCK_USERS[0].id);
  }, []);

  function setUserId(id: string) {
    localStorage.setItem(STORAGE_KEY, id);
    setUserIdState(id);
  }

  const user = MOCK_USERS.find((u) => u.id === userId);

  return (
    <UserContext.Provider value={{ userId, user, users: MOCK_USERS, setUserId }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
