import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  QrCode,
  UserPlus,
  CalendarDays,
  Wrench,
  Car,
  Package,
  MapPin,
  AlertTriangle,
  Sun,
  ChevronRight,
  Bell,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  Minus,
  Thermometer,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useAnnouncementStore } from "@/store/useAnnouncementStore";
import { useMessageStore } from "@/store/useMessageStore";
import { getGreeting } from "@/utils/date";
import { mockElevators } from "@/mock";
import { cn } from "@/lib/utils";

const quickActions = [
  { name: "扫码通行", icon: QrCode, path: "/access", bg: "bg-primary-500", ring: "ring-primary-100" },
  { name: "访客预约", icon: UserPlus, path: "/visitor/reserve", bg: "bg-secondary-500", ring: "ring-secondary-100" },
  { name: "会议室", icon: CalendarDays, path: "/meeting", bg: "bg-accent-500", ring: "ring-accent-100" },
  { name: "报修服务", icon: Wrench, path: "/repair", bg: "bg-purple-500", ring: "ring-purple-100" },
  { name: "停车缴费", icon: Car, path: "/parking", bg: "bg-pink-500", ring: "ring-pink-100" },
  { name: "快递取件", icon: Package, path: "#express", bg: "bg-amber-500", ring: "ring-amber-100" },
  { name: "室内导航", icon: MapPin, path: "/home/navigation", bg: "bg-teal-500", ring: "ring-teal-100" },
  { name: "应急疏散", icon: AlertTriangle, path: "/home/evacuation", bg: "bg-danger-500", ring: "ring-danger-100" },
];

const directionIcons: Record<string, React.ReactNode> = {
  up: <ArrowUp size={14} className="text-success-500" />,
  down: <ArrowDown size={14} className="text-danger-500" />,
  idle: <Minus size={14} className="text-gray-400" />,
};

export default function Home() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { announcements } = useAnnouncementStore();
  const deliveries = useMessageStore((s) => s.deliveries);
  const pendingDeliveries = deliveries.filter((d) => d.status === "pending");

  const [currentSlide, setCurrentSlide] = useState(0);
  const [expressOpen, setExpressOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  useEffect(() => {
    if (scrollRef.current && announcements.length > 0) {
      const cardWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: currentSlide * cardWidth,
        behavior: "smooth",
      });
    }
  }, [currentSlide, announcements.length]);

  const bestElevator = mockElevators
    .filter((e) => e.serving)
    .sort((a, b) => a.estimatedTime - b.estimatedTime)[0];

  const handleAction = (action: (typeof quickActions)[number]) => {
    if (action.path.startsWith("#")) {
      setExpressOpen(true);
    } else {
      navigate(action.path);
    }
  };

  const callEmergency = () => {
    window.location.href = "tel:119";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-400 pt-14 pb-24 px-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1">
              <p className="text-primary-100 text-sm mb-1">{getGreeting()}，欢迎回来</p>
              <h1 className="text-white text-2xl font-bold mb-1">{user.name}</h1>
              <div className="flex items-center gap-2">
                <span className="text-primary-100 text-xs">{user.floor}</span>
                <span className="text-primary-200/60">|</span>
                <span className="text-primary-100 text-xs">{user.department}</span>
              </div>
            </div>
            <button
              onClick={() => navigate("/profile/messages")}
              className="relative w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center active:bg-white/25 transition-colors"
            >
              <Bell size={20} className="text-white" />
              {pendingDeliveries.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                  {pendingDeliveries.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Sun size={18} className="text-amber-300" />
                <span className="text-white font-semibold text-lg">26°C</span>
              </div>
              <p className="text-primary-100 text-xs">晴 · 湿度 45%</p>
            </div>
            <button
              onClick={() => navigate("/profile/messages")}
              className="flex-1 bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20 flex items-center justify-between active:bg-white/25 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-white" />
                <div>
                  <p className="text-white font-semibold text-sm">消息</p>
                  <p className="text-primary-100 text-xs">查看通知</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-white/70" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-16 relative z-20 safe-bottom space-y-4 pb-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: "none" }}
          >
            {announcements.map((a) => (
              <div
                key={a.id}
                className="flex-shrink-0 w-full snap-center p-4 cursor-pointer"
                onClick={() => navigate("/profile/messages")}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      a.priority === "high" ? "bg-danger-50" : a.type === "activity" ? "bg-secondary-50" : "bg-primary-50"
                    )}
                  >
                    <Bell
                      size={18}
                      className={cn(
                        a.priority === "high" ? "text-danger-500" : a.type === "activity" ? "text-secondary-500" : "text-primary-500"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800 text-sm truncate">{a.title}</h3>
                      {a.priority === "high" && (
                        <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 bg-danger-500 text-white rounded-md">重要</span>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs line-clamp-2">{a.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {announcements.length > 1 && (
            <div className="flex justify-center gap-1.5 pb-3">
              {announcements.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    idx === currentSlide ? "w-5 bg-primary-500" : "w-1.5 bg-gray-200"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="grid grid-cols-4 gap-y-5">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.name}
                  onClick={() => handleAction(action)}
                  className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center ring-4",
                      action.bg,
                      action.ring
                    )}
                  >
                    <Icon size={22} className="text-white" strokeWidth={2.2} />
                  </div>
                  <span className="text-xs text-gray-700 font-medium">{action.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">电梯引导</h2>
            <span className="text-xs text-gray-400">实时状态</span>
          </div>

          {bestElevator && (
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-3 mb-3 border border-primary-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-primary-700 font-bold text-lg">{bestElevator.name}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-primary-500 text-white rounded-full">最优选择</span>
                  </div>
                  <p className="text-xs text-gray-500">等待时间约 {bestElevator.estimatedTime} 秒</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-700">{bestElevator.currentFloor}F</p>
                  <div className="flex items-center justify-end gap-1">
                    {directionIcons[bestElevator.direction]}
                    <span className="text-xs text-gray-500">
                      {bestElevator.direction === "up" ? "上行中" : bestElevator.direction === "down" ? "下行中" : "空闲"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {mockElevators.map((e) => (
              <div
                key={e.id}
                className={cn(
                  "rounded-xl p-2.5 border transition-colors",
                  e.id === bestElevator?.id
                    ? "border-primary-200 bg-primary-50/50"
                    : "border-gray-100 bg-gray-50"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{e.name}</span>
                  {directionIcons[e.direction]}
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-xl font-bold text-gray-800">{e.currentFloor}F</span>
                  <span className="text-[11px] text-gray-400">{e.estimatedTime}s</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {pendingDeliveries.length > 0 && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-sm border border-amber-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center">
                  <Package size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">快递待取</h2>
                  <p className="text-xs text-gray-500">共 {pendingDeliveries.length} 件快递</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-1 bg-amber-500 text-white rounded-full font-medium">
                {pendingDeliveries.length}件
              </span>
            </div>

            <div className="space-y-2">
              {pendingDeliveries.slice(0, 2).map((d) => (
                <div key={d.id} className="bg-white rounded-xl p-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-gray-800">{d.company}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{d.lockerLocation}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-xs text-gray-400 mb-0.5">取件码</p>
                    <p className="text-lg font-bold text-primary-700 tracking-wider">{d.pickupCode}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate("/profile/messages")}
              className="w-full mt-3 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium active:bg-amber-600 transition-colors"
            >
              查看全部快递
            </button>
          </div>
        )}

        <button
          onClick={() => navigate("/repair/comfort")}
          className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between active:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-400 to-secondary-500 flex items-center justify-center">
              <Thermometer size={22} className="text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">舒适度反馈</h3>
              <p className="text-xs text-gray-500">温度、照明、通风一键反馈</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>

        <div
          className="w-full bg-gradient-to-r from-danger-500 to-red-600 rounded-2xl shadow-lg shadow-danger-500/25 p-4 flex items-center justify-between"
        >
          <div
          onClick={() => {
            navigate("/home/evacuation");
          }}
          className="flex items-center gap-3 flex-1 cursor-pointer active:opacity-90 transition-opacity"
        >
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center animate-pulse">
              <AlertTriangle size={22} className="text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-white">紧急求助</h3>
              <p className="text-xs text-danger-100">疏散指引 / 应急电话</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
          <button
            onClick={callEmergency}
            className="px-4 py-2 bg-white rounded-xl text-danger-600 text-sm font-bold active:bg-danger-50 transition-colors"
          >
            拨打119
          </button>
          <ChevronRight size={20} className="text-white/80" />
          </div>
        </div>
      </div>
    </div>
  );
}
