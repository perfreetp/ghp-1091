import { create } from "zustand";
import type { MeetingRoom, MeetingBooking } from "@/types";
import { mockMeetingRooms, mockBookings } from "@/mock";
import { storage } from "@/utils/storage";
import { generateOrderId } from "@/utils/format";

interface MeetingState {
  rooms: MeetingRoom[];
  bookings: MeetingBooking[];
  filters: {
    date: string;
    capacity: number;
    equipment: string[];
    keyword: string;
  };
  setFilters: (filters: Partial<MeetingState["filters"]>) => void;
  addBooking: (
    booking: Omit<MeetingBooking, "id" | "createTime" | "status">
  ) => MeetingBooking;
  updateBooking: (id: string, updates: Partial<MeetingBooking>) => void;
  cancelBooking: (id: string) => void;
  getFilteredRooms: () => MeetingRoom[];
  getMyBookings: () => MeetingBooking[];
  getRoomBookings: (roomId: string, date: string) => MeetingBooking[];
}

export const useMeetingStore = create<MeetingState>((set, get) => ({
  rooms: mockMeetingRooms,
  bookings: storage.get("meetingBookings", mockBookings),
  filters: {
    date: new Date().toISOString().slice(0, 10),
    capacity: 0,
    equipment: [],
    keyword: "",
  },

  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),

  addBooking: (booking) => {
    const newBooking: MeetingBooking = {
      ...booking,
      id: generateOrderId("MB"),
      status: "confirmed",
      createTime: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    set((state) => {
      const bookings = [newBooking, ...state.bookings];
      storage.set("meetingBookings", bookings);
      return { bookings };
    });
    return newBooking;
  },

  updateBooking: (id, updates) =>
    set((state) => {
      const bookings: MeetingBooking[] = state.bookings.map((b) =>
        b.id === id ? { ...b, ...updates, status: "changed" as const } : b
      );
      storage.set("meetingBookings", bookings);
      return { bookings };
    }),

  cancelBooking: (id) =>
    set((state) => {
      const bookings: MeetingBooking[] = state.bookings.map((b) =>
        b.id === id ? { ...b, status: "cancelled" as const } : b
      );
      storage.set("meetingBookings", bookings);
      return { bookings };
    }),

  getFilteredRooms: () => {
    const { rooms, filters } = get();
    const keyword = filters.keyword.trim().toLowerCase();
    return rooms.filter((room) => {
      if (filters.capacity > 0 && room.capacity < filters.capacity) return false;
      if (filters.equipment.length > 0) {
        const hasAll = filters.equipment.every((eq) => room.equipment.includes(eq));
        if (!hasAll) return false;
      }
      if (keyword) {
        const nameMatch = room.name.toLowerCase().includes(keyword);
        const floorNum = room.floor.replace(/[Ff楼]/g, "");
        const floorMatch =
          room.floor.toLowerCase().includes(keyword) ||
          floorNum.includes(keyword.replace(/[Ff楼]/g, ""));
        const equipmentMatch = room.equipment.some((eq) =>
          eq.toLowerCase().includes(keyword)
        );
        if (!nameMatch && !floorMatch && !equipmentMatch) return false;
      }
      return true;
    });
  },

  getMyBookings: () => {
    return get().bookings.sort(
      (a, b) => new Date(b.date + " " + b.startTime).getTime() - new Date(a.date + " " + a.startTime).getTime()
    );
  },

  getRoomBookings: (roomId, date) => {
    return get().bookings.filter((b) => b.roomId === roomId && b.date === date && b.status !== "cancelled");
  },
}));
