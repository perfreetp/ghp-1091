import { create } from "zustand";
import type { ParkingSpot, ParkingRecord } from "@/types";
import { generateParkingSpots, mockParkingRecord } from "@/mock";
import { storage } from "@/utils/storage";
import { generateOrderId } from "@/utils/format";

interface ParkingState {
  spots: Record<string, ParkingSpot[]>;
  currentRecord: ParkingRecord | null;
  records: ParkingRecord[];
  plateNumbers: string[];
  selectedFloor: string;
  setSelectedFloor: (floor: string) => void;
  getSpots: (floor: string) => ParkingSpot[];
  payParking: () => void;
  addPlateNumber: (plate: string) => void;
  removePlateNumber: (plate: string) => void;
}

export const useParkingStore = create<ParkingState>((set, get) => ({
  spots: {
    B1: generateParkingSpots("B1"),
    B2: generateParkingSpots("B2"),
    B3: generateParkingSpots("B3"),
  },
  currentRecord: storage.get("currentParking", mockParkingRecord),
  records: storage.get("parkingRecords", [mockParkingRecord]),
  plateNumbers: storage.get("plateNumbers", ["京A·88888"]),
  selectedFloor: "B2",

  setSelectedFloor: (floor) => set({ selectedFloor: floor }),

  getSpots: (floor) => {
    let spots = get().spots[floor];
    if (!spots) {
      spots = generateParkingSpots(floor);
      set((state) => ({ spots: { ...state.spots, [floor]: spots } }));
    }
    return spots;
  },

  payParking: () =>
    set((state) => {
      if (!state.currentRecord) return state;
      const updatedRecord: ParkingRecord = {
        ...state.currentRecord,
        status: "paid",
        leaveTime: new Date().toISOString().slice(0, 16).replace("T", " "),
      };
      storage.set("currentParking", null);
      const records = [updatedRecord, ...state.records];
      storage.set("parkingRecords", records);
      return { currentRecord: null, records };
    }),

  addPlateNumber: (plate) =>
    set((state) => {
      const plateNumbers = [...state.plateNumbers, plate];
      storage.set("plateNumbers", plateNumbers);
      return { plateNumbers };
    }),

  removePlateNumber: (plate) =>
    set((state) => {
      const plateNumbers = state.plateNumbers.filter((p) => p !== plate);
      storage.set("plateNumbers", plateNumbers);
      return { plateNumbers };
    }),
}));
