import { create } from "zustand";
import type { AccessRecord, TempAccessRequest } from "@/types";
import { mockAccessRecords, mockTempRequests } from "@/mock";
import { storage } from "@/utils/storage";
import { generateOrderId } from "@/utils/format";

interface AccessState {
  records: AccessRecord[];
  tempRequests: TempAccessRequest[];
  qrToken: string;
  lastRefresh: number;
  refreshQr: () => void;
  addRecord: (record: Omit<AccessRecord, "id">) => void;
  addTempRequest: (req: Omit<TempAccessRequest, "id" | "createTime" | "status">) => TempAccessRequest;
}

export const useAccessStore = create<AccessState>((set) => ({
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
}));
