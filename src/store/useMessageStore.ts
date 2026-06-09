import { create } from "zustand";
import type { SystemMessage, ExpressDelivery } from "@/types";
import { mockMessages, mockExpressDeliveries } from "@/mock";
import { storage } from "@/utils/storage";

interface MessageState {
  messages: SystemMessage[];
  deliveries: ExpressDelivery[];
  addMessage: (params: { type: SystemMessage["type"]; title: string; content: string; relatedId?: string }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  pickUpDelivery: (id: string) => void;
  getUnreadCount: () => number;
  getPendingDeliveries: () => ExpressDelivery[];
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: storage.get("messages", mockMessages),
  deliveries: storage.get("deliveries", mockExpressDeliveries),

  addMessage: ({ type, title, content, relatedId }) =>
    set((state) => {
      const newMessage: SystemMessage = {
        id: `MSG-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        type,
        title,
        content,
        relatedId,
        isRead: false,
        createTime: new Date().toLocaleString("zh-CN", { hour12: false }),
      };
      const messages = [newMessage, ...state.messages];
      storage.set("messages", messages);
      return { messages };
    }),

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
        d.id === id ? { ...d, status: "picked" as const, pickedTime: new Date().toLocaleString("zh-CN", { hour12: false }) } : d
      );
      storage.set("deliveries", deliveries);
      return { deliveries };
    }),

  getUnreadCount: () => get().messages.filter((m) => !m.isRead).length,

  getPendingDeliveries: () => get().deliveries.filter((d) => d.status === "pending"),
}));
