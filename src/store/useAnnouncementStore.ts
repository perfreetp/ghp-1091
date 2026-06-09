import { create } from "zustand";
import type { Announcement } from "@/types";
import { mockAnnouncements } from "@/mock";
import { storage } from "@/utils/storage";

interface AnnouncementState {
  announcements: Announcement[];
  setAnnouncements: (items: Announcement[]) => void;
  getUnreadHighPriority: () => Announcement[];
}

export const useAnnouncementStore = create<AnnouncementState>((set, get) => ({
  announcements: storage.get("announcements", mockAnnouncements),
  setAnnouncements: (items) => {
    storage.set("announcements", items);
    set({ announcements: items });
  },
  getUnreadHighPriority: () => {
    return get().announcements.filter((a) => a.priority === "high");
  },
}));
