import { create } from "zustand";
import type { VisitorReservation } from "@/types";
import { mockVisitors } from "@/mock";
import { storage } from "@/utils/storage";
import { generateOrderId, generateVisitCode } from "@/utils/format";

interface VisitorState {
  visitors: VisitorReservation[];
  addVisitor: (
    visitor: Omit<VisitorReservation, "id" | "visitCode" | "createTime" | "status" | "hostName">
  ) => VisitorReservation;
  updateVisitor: (id: string, updates: Partial<VisitorReservation>) => void;
  cancelVisitor: (id: string) => void;
  getPendingVisitors: () => VisitorReservation[];
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
}));
