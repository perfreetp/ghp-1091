import { create } from "zustand";
import type { SystemMessage, ExpressDelivery } from "@/types";
import { mockMessages, mockExpressDeliveries } from "@/mock";
import { storage } from "@/utils/storage";

interface MessageState {
  messages: SystemMessage[];
  deliveries: ExpressDelivery[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  pickUpDelivery: (id: string) => void;
  getUnreadCount: () => number;
  getPendingDeliveries: () => ExpressDelivery[];
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: storage.get("messages", mockMessages),
  deliveries: storage.get("deliveries", mockExpressDeliveries),

  markAsRead: (id) =>
    set((state) => {
      const messages = state.messages.map((m) => (m.id === id ? { ...m, isRead: true } : m));
      storage.set("messages", messages);
      return { messages };
    }),

  markAllAsRead: () =>
    set((state) => {
      const messages = state.messages.map((m) => ({ ...m, isRead: true }));
      storage.set("messages", messages);
      return { messages };
    }),

  pickUpDelivery: (id) =>
    set((state) => {
      const deliveries: ExpressDelivery[] = state.deliveries.map((d) =>
        d.id === id ? { ...d, status: "picked" as const } : d
      );
      storage.set("deliveries", deliveries);
      return { deliveries };
    }),

  getUnreadCount: () => get().messages.filter((m) => !m.isRead).length,

  getPendingDeliveries: () => get().deliveries.filter((d) => d.status === "pending"),
}));
