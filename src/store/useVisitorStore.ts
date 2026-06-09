import { create } from "zustand";
import type { VisitorReservation } from "@/types";
import { mockVisitors } from "@/mock";
import { storage } from "@/utils/storage";
import { generateOrderId, generateVisitCode } from "@/utils/format";
import { useMessageStore } from "@/store/useMessageStore";

interface VisitorState {
  visitors: VisitorReservation[];
  addVisitor: (
    visitor: Omit<VisitorReservation, "id" | "visitCode" | "createTime" | "status" | "hostName">
  ) => VisitorReservation;
  updateVisitor: (id: string, updates: Partial<VisitorReservation>) => void;
  cancelVisitor: (id: string) => void;
  getPendingVisitors: () => VisitorReservation[];
  verifyArrival: (visitCode: string) => VisitorReservation | { error: string };
  registerLeave: (id: string) => void;
}

export const useVisitorStore = create<VisitorState>((set, get) => ({
  visitors: storage.get("visitors", mockVisitors),

  addVisitor: (visitor) => {
    const newVisitor: VisitorReservation = {
      ...visitor,
      id: generateOrderId("V"),
      visitCode: generateVisitCode(),
      status: "pending",
      hostName: "张明",
      createTime: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    set((state) => {
      const visitors = [newVisitor, ...state.visitors];
      storage.set("visitors", visitors);
      return { visitors };
    });
    return newVisitor;
  },

  updateVisitor: (id, updates) =>
    set((state) => {
      const visitors = state.visitors.map((v) => (v.id === id ? { ...v, ...updates } : v));
      storage.set("visitors", visitors);
      return { visitors };
    }),

  cancelVisitor: (id) => get().updateVisitor(id, { status: "cancelled" }),

  getPendingVisitors: () => get().visitors.filter((v) => v.status === "pending"),

  verifyArrival: (visitCode) => {
    const code = visitCode.trim().toUpperCase();
    const visitor = get().visitors.find((v) => v.visitCode.toUpperCase() === code);
    if (!visitor) {
      return { error: "到访码无效，请检查后重试" };
    }
    if (visitor.status === "cancelled") {
      return { error: "该访客预约已取消" };
    }
    if (visitor.status === "arrived") {
      return { error: "该访客已完成到达登记" };
    }
    if (visitor.status === "left") {
      return { error: "该访客已离访" };
    }
    const arriveTime = new Date().toLocaleString("zh-CN", { hour12: false });
    const updated: VisitorReservation = { ...visitor, status: "arrived", arriveTime };
    set((state) => {
      const visitors = state.visitors.map((v) => (v.id === visitor.id ? updated : v));
      storage.set("visitors", visitors);
      return { visitors };
    });
    useMessageStore.getState().addMessage({
      type: "notice",
      title: `访客${visitor.visitorName}已到访`,
      content: `到访码${visitCode}已于 ${arriveTime} 完成核验，请接待。`,
      relatedId: visitor.id,
    });
    return updated;
  },

  registerLeave: (id) => {
    const visitor = get().visitors.find((v) => v.id === id);
    if (!visitor || visitor.status !== "arrived") return;
    const actualLeaveTime = new Date().toLocaleString("zh-CN", { hour12: false });
    const updated: VisitorReservation = { ...visitor, status: "left", actualLeaveTime };
    set((state) => {
      const visitors = state.visitors.map((v) => (v.id === id ? updated : v));
      storage.set("visitors", visitors);
      return { visitors };
    });
    useMessageStore.getState().addMessage({
      type: "notice",
      title: "访客已离访",
      content: `${visitor.visitorName} 已完成离访登记，实际离开时间 ${actualLeaveTime}。`,
      relatedId: visitor.id,
    });
  },
}));
