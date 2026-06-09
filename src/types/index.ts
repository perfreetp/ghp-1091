export interface User {
  id: string;
  name: string;
  avatar: string;
  employeeId: string;
  department: string;
  company: string;
  floor: string;
  phone: string;
  role: "employee" | "reception";
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  image?: string;
  type: "notice" | "emergency" | "activity";
  publishTime: string;
  priority: "high" | "normal" | "low";
}

export interface AccessRecord {
  id: string;
  time: string;
  location: string;
  type: "qrcode" | "temporary" | "face";
  status: "success" | "failed";
}

export interface TempAccessRequest {
  id: string;
  applicant: string;
  startTime: string;
  endTime: string;
  area: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createTime: string;
}

export interface VisitorReservation {
  id: string;
  visitorName: string;
  visitorPhone: string;
  visitTime: string;
  leaveTime?: string;
  purpose: string;
  hostName: string;
  visitCode: string;
  plateNumber?: string;
  status: "pending" | "arrived" | "left" | "cancelled";
  createTime: string;
}

export interface MeetingRoom {
  id: string;
  name: string;
  floor: string;
  capacity: number;
  equipment: string[];
  image: string;
  pricePerHour: number;
  description: string;
}

export interface MeetingBooking {
  id: string;
  roomId: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  attendees: number;
  status: "confirmed" | "changed" | "cancelled" | "completed";
  createTime: string;
}

export interface RepairOrder {
  id: string;
  category: string;
  description: string;
  images: string[];
  location: string;
  reporter: string;
  status: "submitted" | "accepted" | "processing" | "completed" | "evaluated";
  createTime: string;
  updateTime: string;
  handler?: string;
}

export interface ParkingSpot {
  id: string;
  spotNumber: string;
  floor: string;
  area: string;
  status: "available" | "occupied" | "reserved";
}

export interface ParkingRecord {
  id: string;
  plateNumber: string;
  spotId?: string;
  enterTime: string;
  leaveTime?: string;
  duration?: string;
  fee: number;
  status: "parking" | "paid" | "completed";
}

export interface ExpressDelivery {
  id: string;
  company: string;
  trackingNo: string;
  pickupCode: string;
  lockerLocation: string;
  receiver: string;
  arriveTime: string;
  status: "pending" | "picked";
  pickedTime?: string;
}

export interface SystemMessage {
  id: string;
  type: "notice" | "approval" | "booking" | "repair" | "system";
  title: string;
  content: string;
  isRead: boolean;
  createTime: string;
  relatedId?: string;
}

export interface ElevatorInfo {
  id: string;
  name: string;
  currentFloor: number;
  direction: "up" | "down" | "idle";
  estimatedTime: number;
  serving: boolean;
}

export interface ComfortFeedback {
  id: string;
  location: string;
  temperature: number;
  lighting: number;
  comment: string;
  createTime: string;
  status: "submitted" | "processing" | "resolved";
}
