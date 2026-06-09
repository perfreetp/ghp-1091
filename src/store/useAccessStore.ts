import { create } from "zustand";
import type { AccessRecord, TempAccessRequest } from "@/types";
import { mockAccessRecords, mockTempRequests } from "@/mock";
import { storage } from "@/utils/storage";
import { generateOrderId, generateRandomCode } from "@/utils/format";
import { useMessageStore } from "@/store/useMessageStore";

interface AccessState {
  records: AccessRecord[];
  tempRequests: TempAccessRequest[];
  qrToken: string;
  lastRefresh: number;
  refreshQr: () => void;
  addRecord: (record: Omit<AccessRecord, "id">) => void;
  addTempRequest: (req: Omit<TempAccessRequest, "id" | "createTime" | "status">) => TempAccessRequest;
  approveTempRequest: (id: string) => void;
  rejectTempRequest: (id: string, rejectReason: string) => void;
}

export const useAccessStore = create<AccessState>((set, get) => ({
  records: storage.get("accessRecords", mockAccessRecords),
  tempRequests: storage.get("tempRequests", mockTempRequests),
  qrToken: `ACCESS-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
  lastRefresh: Date.now(),

  refreshQr: () =>
    set({
      qrToken: `ACCESS-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
      lastRefresh: Date.now(),
    }),

  addRecord: (record) =>
    set((state) => {
      const newRecord: AccessRecord = { ...record, id: generateOrderId("AR") };
      const records = [newRecord, ...state.records];
      storage.set("accessRecords", records);
      return { records };
    }),

  addTempRequest: (req) => {
    const newReq: TempAccessRequest = {
      ...req,
      id: generateOrderId("TAR"),
      status: "pending",
      createTime: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    set((state) => {
      const tempRequests = [newReq, ...state.tempRequests];
      storage.set("tempRequests", tempRequests);
      return { tempRequests };
    });
    return newReq;
  },

  approveTempRequest: (id) => {
    const req = get().tempRequests.find((r) => r.id === id);
    if (!req || req.status !== "pending") return;
    const approvedTime = new Date().toLocaleString("zh-CN", { hour12: false });
    const accessToken = generateRandomCode(6);
    const updated: TempAccessRequest = { ...req, status: "approved", approvedTime, accessToken };
    set((state) => {
      const tempRequests = state.tempRequests.map((r) => (r.id === id ? updated : r));
      storage.set("tempRequests", tempRequests);
      return { tempRequests };
    });
    useMessageStore.getState().addMessage({
      type: "approval",
      title: "临时通行已通过",
      content: `您申请的 ${req.area} 临时通行已通过审批。通行凭证：${accessToken}，有效期 ${req.startTime}~${req.endTime}。`,
      relatedId: req.id,
    });
  },

  rejectTempRequest: (id, rejectReason) => {
    const req = get().tempRequests.find((r) => r.id === id);
    if (!req || req.status !== "pending") return;
    const updated: TempAccessRequest = { ...req, status: "rejected", rejectReason };
    set((state) => {
      const tempRequests = state.tempRequests.map((r) => (r.id === id ? updated : r));
      storage.set("tempRequests", tempRequests);
      return { tempRequests };
    });
    useMessageStore.getState().addMessage({
      type: "approval",
      title: "临时通行被拒绝",
      content: `很抱歉，您的临时通行申请未通过。原因：${rejectReason}。如有疑问请联系前台。`,
      relatedId: req.id,
    });
  },
}));
