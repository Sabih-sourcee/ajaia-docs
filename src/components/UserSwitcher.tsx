"use client";

import { useUser } from "./UserProvider";

export function UserSwitcher() {
  const { userId, users, setUserId } = useUser();

  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor="user-switcher" className="text-gray-500">
        Sign in as <span className="italic">(mocked auth)</span>:
      </label>
      <select
        id="user-switcher"
        className="rounded border border-gray-300 bg-white px-2 py-1"
        value={userId ?? ""}
        onChange={(e) => setUserId(e.target.value)}
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
    </div>
  );
}
