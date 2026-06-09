import type {
  User,
  Announcement,
  AccessRecord,
  TempAccessRequest,
  VisitorReservation,
  MeetingRoom,
  MeetingBooking,
  RepairOrder,
  ParkingSpot,
  ParkingRecord,
  ExpressDelivery,
  SystemMessage,
  ElevatorInfo,
} from "@/types";

export const mockUser: User = {
  id: "U001",
  name: "张明",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhangming",
  employeeId: "EMP2024001",
  department: "产品研发部",
  company: "智慧科技有限公司",
  floor: "18F",
  phone: "138****8888",
  role: "employee",
};

export const mockAnnouncements: Announcement[] = [
  {
    id: "A001",
    title: "电梯年检通知",
    content: "本周六（6月14日）上午9:00-12:00将进行A座电梯年度安全检测，请合理安排出行。",
    type: "notice",
    publishTime: "2026-06-09 09:00",
    priority: "high",
  },
  {
    id: "A002",
    title: "消防演练公告",
    content: "下周三（6月18日）下午15:00将进行全楼消防应急疏散演练，请各位同事积极配合。",
    type: "activity",
    publishTime: "2026-06-08 14:30",
    priority: "normal",
  },
  {
    id: "A003",
    title: "空调系统维护",
    content: "6月10日晚22:00-次日06:00中央空调系统清洗维护，期间空调暂停使用。",
    type: "notice",
    publishTime: "2026-06-07 16:00",
    priority: "normal",
  },
  {
    id: "A004",
    title: "楼宇安全提示",
    content: "近期发现有陌生人尾随进入，请各位同事提高警惕，刷卡进出随手关门。",
    type: "emergency",
    publishTime: "2026-06-06 10:15",
    priority: "high",
  },
];

export const mockAccessRecords: AccessRecord[] = [
  { id: "AR001", time: "2026-06-09 08:32", location: "A座1号门", type: "qrcode", status: "success" },
  { id: "AR002", time: "2026-06-09 12:15", location: "B座餐饮区入口", type: "qrcode", status: "success" },
  { id: "AR003", time: "2026-06-09 13:40", location: "A座1号门", type: "face", status: "success" },
  { id: "AR004", time: "2026-06-08 08:45", location: "A座1号门", type: "qrcode", status: "success" },
  { id: "AR005", time: "2026-06-08 19:22", location: "停车场入口", type: "qrcode", status: "success" },
];

export const mockTempRequests: TempAccessRequest[] = [
  {
    id: "TAR001",
    applicant: "张明",
    startTime: "2026-06-10 14:00",
    endTime: "2026-06-10 18:00",
    area: "22F-25F 数据中心区域",
    reason: "服务器巡检与维护",
    status: "approved",
    createTime: "2026-06-09 10:00",
  },
  {
    id: "TAR002",
    applicant: "张明",
    startTime: "2026-06-12 09:00",
    endTime: "2026-06-12 12:00",
    area: "B1 档案库",
    reason: "调取历史合同档案",
    status: "pending",
    createTime: "2026-06-09 15:30",
  },
];

export const mockVisitors: VisitorReservation[] = [
  {
    id: "V001",
    visitorName: "李华",
    visitorPhone: "13900139000",
    visitTime: "2026-06-10 10:00",
    purpose: "项目合作洽谈",
    hostName: "张明",
    visitCode: "LK8M4X2P",
    plateNumber: "京A12345",
    status: "pending",
    createTime: "2026-06-09 14:00",
  },
  {
    id: "V002",
    visitorName: "王芳",
    visitorPhone: "13800138000",
    visitTime: "2026-06-09 14:30",
    leaveTime: "2026-06-09 16:00",
    purpose: "合同签署",
    hostName: "张明",
    visitCode: "MN7Q9R3T",
    status: "arrived",
    createTime: "2026-06-09 09:00",
  },
  {
    id: "V003",
    visitorName: "陈伟",
    visitorPhone: "13700137000",
    visitTime: "2026-06-08 09:30",
    leaveTime: "2026-06-08 11:45",
    purpose: "技术交流",
    hostName: "张明",
    visitCode: "HJ5W6Y8U",
    status: "left",
    createTime: "2026-06-07 16:00",
  },
];

export const mockMeetingRooms: MeetingRoom[] = [
  {
    id: "MR001",
    name: "创新厅",
    floor: "18F",
    capacity: 12,
    equipment: ["投影仪", "白板", "视频会议", "电话会议"],
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop",
    pricePerHour: 120,
    description: "宽敞明亮，适合中大型团队会议、项目评审",
  },
  {
    id: "MR002",
    name: "协作间A",
    floor: "18F",
    capacity: 6,
    equipment: ["电视屏幕", "白板"],
    image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=400&h=250&fit=crop",
    pricePerHour: 60,
    description: "小型讨论室，适合小组头脑风暴",
  },
  {
    id: "MR003",
    name: "董事会议室",
    floor: "20F",
    capacity: 20,
    equipment: ["投影仪", "视频会议", "电话会议", "音响系统"],
    image: "https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=400&h=250&fit=crop",
    pricePerHour: 300,
    description: "高端会议室，适合重要客户接待、董事会",
  },
  {
    id: "MR004",
    name: "协作间B",
    floor: "18F",
    capacity: 4,
    equipment: ["电视屏幕"],
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=250&fit=crop",
    pricePerHour: 40,
    description: "迷你会议室，适合1对1沟通、面试",
  },
  {
    id: "MR005",
    name: "培训室",
    floor: "19F",
    capacity: 30,
    equipment: ["投影仪", "麦克风", "音响系统", "录制设备"],
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=250&fit=crop",
    pricePerHour: 200,
    description: "大型培训空间，阶梯座位设计",
  },
];

export const mockBookings: MeetingBooking[] = [
  {
    id: "MB001",
    roomId: "MR001",
    roomName: "创新厅",
    date: "2026-06-10",
    startTime: "14:00",
    endTime: "16:00",
    title: "Q2产品评审会",
    attendees: 10,
    status: "confirmed",
    createTime: "2026-06-08 10:00",
  },
  {
    id: "MB002",
    roomId: "MR002",
    roomName: "协作间A",
    date: "2026-06-10",
    startTime: "10:00",
    endTime: "11:30",
    title: "设计方案讨论",
    attendees: 5,
    status: "confirmed",
    createTime: "2026-06-09 09:30",
  },
  {
    id: "MB003",
    roomId: "MR004",
    roomName: "协作间B",
    date: "2026-06-09",
    startTime: "15:00",
    endTime: "15:30",
    title: "候选人面试",
    attendees: 2,
    status: "completed",
    createTime: "2026-06-08 16:00",
  },
];

export const mockRepairOrders: RepairOrder[] = [
  {
    id: "RO001",
    category: "空调故障",
    description: "工位附近空调出风温度过高，制冷效果差",
    images: [],
    location: "18F A区 1803工位附近",
    reporter: "张明",
    status: "processing",
    createTime: "2026-06-09 10:15",
    updateTime: "2026-06-09 11:00",
    handler: "李师傅",
  },
  {
    id: "RO002",
    category: "照明问题",
    description: "会议室部分灯具闪烁",
    images: [],
    location: "18F 协作间A",
    reporter: "张明",
    status: "completed",
    createTime: "2026-06-07 14:30",
    updateTime: "2026-06-07 17:00",
    handler: "王师傅",
  },
  {
    id: "RO003",
    category: "设施维修",
    description: "茶水间咖啡机故障，不出咖啡",
    images: [],
    location: "18F 茶水间",
    reporter: "张明",
    status: "submitted",
    createTime: "2026-06-09 15:00",
    updateTime: "2026-06-09 15:00",
  },
];

export const generateParkingSpots = (floor: string): ParkingSpot[] => {
  const spots: ParkingSpot[] = [];
  const areas = ["A", "B", "C"];
  areas.forEach((area) => {
    for (let i = 1; i <= 20; i++) {
      const random = Math.random();
      spots.push({
        id: `${floor}-${area}-${i}`,
        spotNumber: `${area}${String(i).padStart(2, "0")}`,
        floor,
        area,
        status: random > 0.55 ? "occupied" : random > 0.45 ? "reserved" : "available",
      });
    }
  });
  return spots;
};

export const mockParkingRecord: ParkingRecord = {
  id: "PR001",
  plateNumber: "京A·88888",
  spotId: "B2-A-08",
  enterTime: "2026-06-09 08:25",
  duration: "6小时32分",
  fee: 58,
  status: "parking",
};

export const mockExpressDeliveries: ExpressDelivery[] = [
  {
    id: "ED001",
    company: "顺丰速运",
    trackingNo: "SF1234567890",
    pickupCode: "8-2-1856",
    lockerLocation: "1F大堂智能快递柜A区",
    receiver: "张明",
    arriveTime: "2026-06-09 09:30",
    status: "pending",
  },
  {
    id: "ED002",
    company: "京东物流",
    trackingNo: "JD9876543210",
    pickupCode: "5-3-0921",
    lockerLocation: "1F大堂智能快递柜B区",
    receiver: "张明",
    arriveTime: "2026-06-09 11:15",
    status: "pending",
  },
  {
    id: "ED003",
    company: "中通快递",
    trackingNo: "ZT5566778899",
    pickupCode: "3-1-0428",
    lockerLocation: "1F大堂智能快递柜A区",
    receiver: "张明",
    arriveTime: "2026-06-08 16:45",
    status: "picked",
  },
];

export const mockMessages: SystemMessage[] = [
  {
    id: "SM001",
    type: "notice",
    title: "电梯年检通知",
    content: "本周六（6月14日）上午9:00-12:00将进行A座电梯年度安全检测",
    isRead: false,
    createTime: "2026-06-09 09:00",
  },
  {
    id: "SM002",
    type: "approval",
    title: "临时通行已通过",
    content: "您申请的临时通行权限已通过审批，有效期6月10日14:00-18:00",
    isRead: false,
    createTime: "2026-06-09 11:30",
    relatedId: "TAR001",
  },
  {
    id: "SM003",
    type: "booking",
    title: "会议室预订成功",
    content: "创新厅 6月10日 14:00-16:00 预订已确认",
    isRead: true,
    createTime: "2026-06-08 10:05",
    relatedId: "MB001",
  },
  {
    id: "SM004",
    type: "repair",
    title: "报修单已受理",
    content: "您的空调故障报修单已受理，李师傅将在30分钟内到达",
    isRead: true,
    createTime: "2026-06-09 10:20",
    relatedId: "RO001",
  },
  {
    id: "SM005",
    type: "system",
    title: "快递到达提醒",
    content: "您有2个快递已存入智能快递柜，请及时取件",
    isRead: false,
    createTime: "2026-06-09 11:20",
  },
];

export const mockElevators: ElevatorInfo[] = [
  { id: "E1", name: "A梯(低区)", currentFloor: 15, direction: "up", estimatedTime: 25, serving: true },
  { id: "E2", name: "B梯(低区)", currentFloor: 18, direction: "idle", estimatedTime: 8, serving: true },
  { id: "E3", name: "C梯(高区)", currentFloor: 22, direction: "down", estimatedTime: 45, serving: true },
  { id: "E4", name: "D梯(高区)", currentFloor: 5, direction: "up", estimatedTime: 60, serving: true },
];
