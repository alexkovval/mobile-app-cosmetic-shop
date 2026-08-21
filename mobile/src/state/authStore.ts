import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { User } from "../types";

const TOKEN_KEY = "cosmetics.auth.token";
const USER_KEY = "cosmetics.auth.user";

interface AuthState {
  token: string | null;
  user: User | null;
  isHydrating: boolean;
  hydrate: () => Promise<void>;
  setSession: (token: string, user: User) => Promise<void>;
  clearSession: () => Promise<void>;
}

/**
 * Local/UI-ish state (session presence) that happens to need persistence —
 * NOT server state, so it lives in Zustand rather than React Query. There is
 * no "session" endpoint being cached/invalidated here; this is just "is the
 * user logged in right now," read once at launch and written on
 * login/logout. See ARCHITECTURE_PLAN.md §6 for the full rationale on why
 * this is split from React Query and from React Hook Form state.
 */
export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isHydrating: true,

  hydrate: async () => {
    try {
      const [token, userJson] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);
      set({
        token,
        user: userJson ? (JSON.parse(userJson) as User) : null,
        isHydrating: false,
      });
    } catch {
      set({ token: null, user: null, isHydrating: false });
    }
  },

  setSession: async (token, user) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
    ]);
    set({ token, user });
  },

  clearSession: async () => {
    await Promise.all([SecureStore.deleteItemAsync(TOKEN_KEY), SecureStore.deleteItemAsync(USER_KEY)]);
    set({ token: null, user: null });
  },
}));
