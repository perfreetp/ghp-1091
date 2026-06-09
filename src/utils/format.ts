export const formatMoney = (amount: number, symbol: string = "¥"): string => {
  return `${symbol}${amount.toFixed(2)}`;
};

export const formatPhone = (phone: string): string => {
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1****$3");
};

export const formatPlateNumber = (plate: string): string => {
  return plate.toUpperCase().replace(/\s/g, "");
};

export const generateRandomCode = (length: number = 6): string => {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
};

export const generateVisitCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateOrderId = (prefix: string = ""): string => {
  const now = new Date();
  const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(
    now.getMinutes()
  ).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}${timestamp}${random}`;
};

export const statusTextMap: Record<string, string> = {
  submitted: "已提交",
  accepted: "已受理",
  processing: "处理中",
  completed: "已完成",
  evaluated: "已评价",
  pending: "待处理",
  approved: "已通过",
  rejected: "已拒绝",
  arrived: "已到访",
  left: "已离开",
  cancelled: "已取消",
  confirmed: "已确认",
  changed: "已改签",
  parking: "停车中",
  paid: "已缴费",
  available: "空闲",
  occupied: "占用",
  reserved: "已预定",
};

export const getStatusText = (status: string): string => {
  return statusTextMap[status] || status;
};
