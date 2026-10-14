// Mocked user directory. Auth is NOT real: the app lets a reviewer pick one
// of these seeded users from a dropdown, stores the choice in localStorage,
// and sends it as the `x-user-id` header on every API request.
export type MockUser = {
  id: string;
  name: string;
  email: string;
};

export const MOCK_USERS: MockUser[] = [
  { id: "11111111-1111-1111-1111-111111111111", name: "Alice", email: "alice@ajaia.dev" },
  { id: "22222222-2222-2222-2222-222222222222", name: "Bob", email: "bob@ajaia.dev" },
  { id: "33333333-3333-3333-3333-333333333333", name: "Carol", email: "carol@ajaia.dev" },
];

export function findMockUser(id: string | null | undefined): MockUser | undefined {
  return MOCK_USERS.find((u) => u.id === id);
}
