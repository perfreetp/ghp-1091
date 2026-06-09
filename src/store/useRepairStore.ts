import { create } from "zustand";
import type { RepairOrder, ComfortFeedback, CommunicationMessage } from "@/types";
import { mockRepairOrders } from "@/mock";
import { storage } from "@/utils/storage";
import { generateOrderId } from "@/utils/format";
import { useMessageStore } from "./useMessageStore";

export const repairCategories = [
  { id: "facility", name: "设施维修", icon: "Wrench", color: "bg-blue-100 text-blue-700" },
  { id: "aircon", name: "空调故障", icon: "Thermometer", color: "bg-cyan-100 text-cyan-700" },
  { id: "lighting", name: "照明问题", icon: "Lightbulb", color: "bg-yellow-100 text-yellow-700" },
  { id: "network", name: "网络问题", icon: "Wifi", color: "bg-purple-100 text-purple-700" },
  { id: "plumbing", name: "水电维修", icon: "Droplets", color: "bg-teal-100 text-teal-700" },
  { id: "other", name: "其他问题", icon: "MoreHorizontal", color: "bg-gray-100 text-gray-700" },
];

const getCategoryName = (category: string): string => {
  const cat = repairCategories.find((c) => c.id === category);
  return cat ? cat.name : category;
};

interface RepairState {
  orders: RepairOrder[];
  feedbacks: ComfortFeedback[];
  addOrder: (order: Omit<RepairOrder, "id" | "createTime" | "updateTime" | "status" | "reporter">) => RepairOrder;
  updateOrder: (id: string, updates: Partial<RepairOrder>) => void;
  urgeOrder: (id: string) => RepairOrder | undefined;
  completeOrder: (id: string) => void;
  evaluateOrder: (id: string, rating: number, evaluation: string) => void;
  addCommunication: (
    orderId: string,
    msg: Omit<CommunicationMessage, "id" | "time">
  ) => void;
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
    if (updatedOrder) {
      useMessageStore.getState().updateMessageByRelatedId(id, "repair", {
        title: "已催单 - 报修单加急处理中",
        content: `您的${getCategoryName(updatedOrder.category)}报修单已催单${updatedOrder.urgeCount}次，当前状态：处理中。工作人员将尽快到场处理。位置：${updatedOrder.location}`
      });
    }
    return updatedOrder;
  },

  completeOrder: (id) => {
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    let completedOrder: RepairOrder | undefined;
    set((state) => {
      const orders = state.orders.map((o) => {
        if (o.id === id) {
          completedOrder = {
            ...o,
            status: "completed",
            updateTime: now,
            timelineLogs: [
              ...(o.timelineLogs || []),
              { status: "completed", handler: "李工程师", time: now },
            ],
          };
          return completedOrder;
        }
        return o;
      });
      storage.set("repairOrders", orders);
      return { orders };
    });
    if (completedOrder) {
      useMessageStore.getState().updateMessageByRelatedId(id, "repair", {
        title: "报修已完成 - 请验收",
        content: `您的${getCategoryName(completedOrder.category)}报修已完成，维修人员已离开现场。请您验收，满意请给予评价~`
      });
    }
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
    useMessageStore.getState().updateMessageByRelatedId(id, "repair", {
      title: `已评价 ${rating}星 - 报修服务完成`,
      content: `您的报修单已完成并给出了${rating}星评价。感谢您的反馈，我们会持续改进。`
    });
  },

  addCommunication: (orderId, msg) => {
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    const newMsg: CommunicationMessage = {
      ...msg,
      id: `CM-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      time: now,
    };
    let targetOrder: RepairOrder | undefined;
    set((state) => {
      const orders = state.orders.map((o) => {
        if (o.id === orderId) {
          targetOrder = {
            ...o,
            communications: [...(o.communications || []), newMsg],
            updateTime: now,
          };
          return targetOrder;
        }
        return o;
      });
      storage.set("repairOrders", orders);
      return { orders };
    });

    if (msg.sender === "staff" && targetOrder) {
      const truncated = newMsg.content.length > 30 ? newMsg.content.slice(0, 30) + "..." : newMsg.content;
      useMessageStore.getState().updateMessageByRelatedId(orderId, "repair", {
        title: "维修沟通：您有1条新回复",
        content: truncated
      });
    }

    if (msg.sender === "user") {
      setTimeout(() => {
        const order = get().orders.find((o) => o.id === orderId);
        const staffCount = (order?.communications || []).filter((c) => c.sender === "staff").length;
        let replyContent = "好的，已收到您的反馈，我会尽快处理。";
        if (staffCount === 0) {
          replyContent = "您好，我是负责此工单的李工程师，已收到您的补充说明，正在赶来路上，预计15分钟到达。";
        } else if (msg.content.includes("照片") || (msg.images && msg.images.length > 0)) {
          replyContent = "图片已收到，我会提前准备好对应配件。";
        }
        get().addCommunication(orderId, {
          sender: "staff",
          senderName: "李工程师",
          content: replyContent,
          images: [],
        });
      }, 3000);
    }
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
