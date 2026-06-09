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
  urgeOrder: (id: string) => RepairOrder | undefined;
  evaluateOrder: (id: string, rating: number, evaluation: string) => void;
  addFeedback: (feedback: Omit<ComfortFeedback, "id" | "createTime" | "status">) => void;
  getActiveOrders: () => RepairOrder[];
}

export const useRepairStore = create<RepairState>((set, get) => ({
  orders: storage.get("repairOrders", mockRepairOrders),
  feedbacks: storage.get("comfortFeedbacks", [] as ComfortFeedback[]),

  addOrder: (order) => {
    const createTime = new Date().toISOString().slice(0, 16).replace("T", " ");
    const newOrder: RepairOrder = {
      ...order,
      id: generateOrderId("RO"),
      status: "submitted",
      reporter: "张明",
      createTime,
      updateTime: createTime,
      urgeCount: 0,
      lastUrgeTime: undefined,
      timelineLogs: [
        { status: "submitted", handler: "系统", time: createTime },
      ],
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

  urgeOrder: (id) => {
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    let updatedOrder: RepairOrder | undefined;
    set((state) => {
      const orders = state.orders.map((o) => {
        if (o.id === id) {
          const newUrgeCount = (o.urgeCount || 0) + 1;
          const newStatus = ["submitted", "accepted"].includes(o.status) ? "processing" : o.status;
          updatedOrder = {
            ...o,
            urgeCount: newUrgeCount,
            lastUrgeTime: now,
            status: newStatus as RepairOrder["status"],
            updateTime: now,
            timelineLogs: newStatus !== o.status
              ? [...(o.timelineLogs || []), { status: "processing", handler: "系统（催单）", time: now }]
              : o.timelineLogs,
          };
          return updatedOrder;
        }
        return o;
      });
      storage.set("repairOrders", orders);
      return { orders };
    });
    return updatedOrder;
  },

  evaluateOrder: (id, rating, evaluation) => {
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    set((state) => {
      const orders = state.orders.map((o) => {
        if (o.id === id) {
          return {
            ...o,
            rating,
            evaluation,
            evaluatedTime: now,
            status: "evaluated" as RepairOrder["status"],
            updateTime: now,
            timelineLogs: [
              ...(o.timelineLogs || []),
              { status: "evaluated", handler: "张明（自己）", time: now },
            ],
          };
        }
        return o;
      });
      storage.set("repairOrders", orders);
      return { orders };
    });
  },

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
