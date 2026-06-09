import { create } from "zustand";
import type { User } from "@/types";
import { mockUser } from "@/mock";
import { storage } from "@/utils/storage";

interface UserState {
  user: User;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: storage.get("user", mockUser),
  setUser: (user) => {
    storage.set("user", user);
    set({ user });
  },
  updateUser: (updates) =>
    set((state) => {
      const newUser = { ...state.user, ...updates };
      storage.set("user", newUser);
      return { user: newUser };
    }),
}));
