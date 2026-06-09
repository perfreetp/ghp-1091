import { create } from "zustand";
import type { RepairOrder, ComfortFeedback } from "@/types";
import { mockRepairOrders } from "@/mock";
import { storage } from "@/utils/storage";
import { generateOrderId } from "@/utils/format";

export const repairCategories = [
  { id: "facility", name: "设施维修", icon: "Wrench", color: "bg-blue-100 text-blue-700" },
  { id: "aircon", name: "空调故障", icon: "Thermometer", color: "bg-cyan-100 text-cyan-700" },
  { id: "lighting", name: "照明问题", icon: "Lightbulb", color: "bg-yellow-100 text-yellow-700" },
  { id: "network", name: "网络问题", icon: "Wifi", color: "bg-purple-100 text-purple-700" },
  { id: "plumbing", name: "水电维修", icon: "Droplets", color: "bg-teal-100 text-teal-700" },
  { id: "other", name: "其他问题", icon: "MoreHorizontal", color: "bg-gray-100 text-gray-700" },
];

interface RepairState {
  orders: RepairOrder[];
  feedbacks: ComfortFeedback[];
  addOrder: (order: Omit<RepairOrder, "id" | "createTime" | "updateTime" | "status" | "reporter">) => RepairOrder;
  updateOrder: (id: string, updates: Partial<RepairOrder>) => void;
  addFeedback: (feedback: Omit<ComfortFeedback, "id" | "createTime" | "status">) => void;
  getActiveOrders: () => RepairOrder[];
}

export const useRepairStore = create<RepairState>((set, get) => ({
  orders: storage.get("repairOrders", mockRepairOrders),
  feedbacks: storage.get("comfortFeedbacks", [] as ComfortFeedback[]),

  addOrder: (order) => {
    const newOrder: RepairOrder = {
      ...order,
      id: generateOrderId("RO"),
      status: "submitted",
      reporter: "张明",
      createTime: new Date().toISOString().slice(0, 16).replace("T", " "),
      updateTime: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    set((state) => {
      const orders = [newOrder, ...state.orders];
      storage.set("repairOrders", orders);
      return { orders };
    });
    return newOrder;
  },

  updateOrder: (id, updates) =>
    set((state) => {
      const orders = state.orders.map((o) =>
        o.id === id
          ? { ...o, ...updates, updateTime: new Date().toISOString().slice(0, 16).replace("T", " ") }
          : o
      );
      storage.set("repairOrders", orders);
      return { orders };
    }),

  addFeedback: (feedback) =>
    set((state) => {
      const newFeedback: ComfortFeedback = {
        ...feedback,
        id: generateOrderId("CF"),
        status: "submitted",
        createTime: new Date().toISOString().slice(0, 16).replace("T", " "),
      };
      const feedbacks = [newFeedback, ...state.feedbacks];
      storage.set("comfortFeedbacks", feedbacks);
      return { feedbacks };
    }),

  getActiveOrders: () =>
    get().orders.filter((o) => !["completed", "evaluated"].includes(o.status)),
}));
