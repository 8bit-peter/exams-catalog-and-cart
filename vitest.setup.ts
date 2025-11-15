import { vi } from "vitest";

// Shared state storage for mocking useState in tests
// This is used by test files to manage mock state
const stateStorage = new Map<string, any>();

// Mock useState globally - needed because tests use useState directly
// (not just through #app module mock)
vi.stubGlobal("useState", <T>(key: string, init?: () => T) => {
  if (!stateStorage.has(key)) {
    stateStorage.set(key, { value: init ? init() : null });
  }
  return stateStorage.get(key);
});

export { stateStorage };
