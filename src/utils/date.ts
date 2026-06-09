export const formatDate = (date: Date | string, format: string = "YYYY-MM-DD"): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes);
};

export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, "YYYY-MM-DD HH:mm");
};

export const formatTime = (date: Date | string): string => {
  return formatDate(date, "HH:mm");
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 6) return "凌晨好";
  if (hour < 12) return "早上好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  return "晚上好";
};

export const getDateLabel = (offset: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  if (offset === 0) return "今天";
  if (offset === 1) return "明天";
  if (offset === 2) return "后天";
  return weekdays[d.getDay()];
};

export const generateTimeSlots = (startHour = 8, endHour = 20, interval = 30): string[] => {
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += interval) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
};
