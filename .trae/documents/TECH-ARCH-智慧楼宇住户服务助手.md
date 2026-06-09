## 1. 架构设计

```mermaid
graph TD
    "移动端App (React+TS)" --> "状态管理层 (Zustand)"
    "状态管理层" --> "API服务层"
    "API服务层" --> "Mock数据模块"
    "移动端App" --> "UI组件层"
    "UI组件层" --> "通用组件库"
    "UI组件层" --> "页面模块"
    "页面模块" --> "首页模块"
    "页面模块" --> "通行模块"
    "页面模块" --> "访客模块"
    "页面模块" --> "会议室模块"
    "页面模块" --> "报修模块"
    "页面模块" --> "停车模块"
    "页面模块" --> "我的模块"
```

## 2. 技术描述

- **前端框架**：React@18 + TypeScript@5
- **构建工具**：Vite@5
- **样式方案**：Tailwind CSS@3 + CSS Variables
- **路由管理**：React Router DOM@6
- **状态管理**：Zustand@4
- **图标库**：Lucide React
- **二维码生成**：qrcode.react
- **后端方案**：纯前端Mock数据（无需真实后端），使用本地状态模拟持久化
- **数据持久化**：localStorage 存储用户偏好与临时数据

## 3. 路由定义

| 路由路径 | 页面名称 | 说明 |
|---------|---------|------|
| / | 首页重定向 | 重定向至首页 |
| /home | 首页 | 公告、快捷入口、电梯引导、快递、疏散 |
| /access | 通行页 | 二维码、临时通行申请、通行记录 |
| /access/temp | 临时通行申请页 | 申请表单 |
| /visitor | 访客页 | 访客列表、预约入口 |
| /visitor/reserve | 访客预约页 | 预约表单、到访码生成 |
| /meeting | 会议室页 | 搜索、列表、筛选 |
| /meeting/:id | 会议室详情页 | 时段选择、预订确认 |
| /meeting/my | 我的预订页 | 改签、取消 |
| /repair | 报修页 | 分类入口、进度列表 |
| /repair/submit | 报修提交页 | 拍照上传、表单填写 |
| /repair/comfort | 舒适度反馈页 | 温度/照明滑块 |
| /parking | 停车页 | 车位地图、缴费入口 |
| /parking/pay | 停车缴费页 | 费用展示、支付方式 |
| /profile | 我的页 | 个人中心、功能入口列表 |
| /profile/satisfaction | 满意度评价页 | 星级评价表单 |
| /profile/messages | 消息中心页 | 通知消息列表 |

## 4. 数据模型定义

### 4.1 核心数据类型

```typescript
// 用户信息
interface User {
  id: string;
  name: string;
  avatar: string;
  employeeId: string;
  department: string;
  company: string;
  floor: string;
  phone: string;
  role: 'employee' | 'reception';
}

// 楼宇公告
interface Announcement {
  id: string;
  title: string;
  content: string;
  image?: string;
  type: 'notice' | 'emergency' | 'activity';
  publishTime: string;
  priority: 'high' | 'normal' | 'low';
}

// 通行记录
interface AccessRecord {
  id: string;
  time: string;
  location: string;
  type: 'qrcode' | 'temporary' | 'face';
  status: 'success' | 'failed';
}

// 临时通行申请
interface TempAccessRequest {
  id: string;
  applicant: string;
  startTime: string;
  endTime: string;
  area: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createTime: string;
}

// 访客预约
interface VisitorReservation {
  id: string;
  visitorName: string;
  visitorPhone: string;
  visitTime: string;
  leaveTime?: string;
  purpose: string;
  hostName: string;
  visitCode: string;
  plateNumber?: string;
  status: 'pending' | 'arrived' | 'left' | 'cancelled';
  createTime: string;
}

// 会议室
interface MeetingRoom {
  id: string;
  name: string;
  floor: string;
  capacity: number;
  equipment: string[];
  image: string;
  pricePerHour: number;
  description: string;
}

// 会议室预订
interface MeetingBooking {
  id: string;
  roomId: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  attendees: number;
  status: 'confirmed' | 'changed' | 'cancelled' | 'completed';
  createTime: string;
}

// 报修单
interface RepairOrder {
  id: string;
  category: string;
  description: string;
  images: string[];
  location: string;
  reporter: string;
  status: 'submitted' | 'accepted' | 'processing' | 'completed' | 'evaluated';
  createTime: string;
  updateTime: string;
  handler?: string;
}

// 车位信息
interface ParkingSpot {
  id: string;
  spotNumber: string;
  floor: string;
  area: string;
  status: 'available' | 'occupied' | 'reserved';
}

// 停车记录
interface ParkingRecord {
  id: string;
  plateNumber: string;
  spotId?: string;
  enterTime: string;
  leaveTime?: string;
  duration?: string;
  fee: number;
  status: 'parking' | 'paid' | 'completed';
}

// 快递通知
interface ExpressDelivery {
  id: string;
  company: string;
  trackingNo: string;
  pickupCode: string;
  lockerLocation: string;
  receiver: string;
  arriveTime: string;
  status: 'pending' | 'picked';
}

// 系统消息
interface SystemMessage {
  id: string;
  type: 'notice' | 'approval' | 'booking' | 'repair' | 'system';
  title: string;
  content: string;
  isRead: boolean;
  createTime: string;
  relatedId?: string;
}
```

## 5. 目录结构

```
src/
├── components/          # 通用组件
│   ├── layout/         # 布局组件（底部导航、顶部栏）
│   ├── ui/             # 基础UI组件（按钮、卡片、标签）
│   └── shared/         # 业务共用组件
├── pages/              # 页面组件
│   ├── Home/
│   ├── Access/
│   ├── Visitor/
│   ├── Meeting/
│   ├── Repair/
│   ├── Parking/
│   └── Profile/
├── store/              # Zustand状态管理
│   ├── useUserStore.ts
│   ├── useAnnouncementStore.ts
│   ├── useAccessStore.ts
│   ├── useVisitorStore.ts
│   ├── useMeetingStore.ts
│   ├── useRepairStore.ts
│   ├── useParkingStore.ts
│   └── useMessageStore.ts
├── mock/               # Mock数据
│   ├── index.ts
│   ├── user.ts
│   ├── announcements.ts
│   ├── access.ts
│   ├── visitor.ts
│   ├── meeting.ts
│   ├── repair.ts
│   ├── parking.ts
│   └── messages.ts
├── types/              # TypeScript类型定义
│   └── index.ts
├── utils/              # 工具函数
│   ├── date.ts
│   ├── storage.ts
│   └── format.ts
├── hooks/              # 自定义Hooks
│   ├── useCountdown.ts
│   └── useQrcode.ts
├── App.tsx
├── main.tsx
└── index.css
```
