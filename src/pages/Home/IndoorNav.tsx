import { useState, useMemo } from "react";
import {
  MapPin,
  Search,
  Coffee,
  Users,
  Droplets,
  Briefcase,
  Printer,
  HeartPulse,
  ArrowUpDown,
  ArrowRight,
  ChevronRight,
  Footprints,
  Clock,
  X,
  Navigation,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";

interface Destination {
  id: string;
  name: string;
  icon: typeof Coffee;
  category: string;
  floor: number;
  location: string;
  distance: string;
  walkTime: number;
  steps: string[];
  x: number;
  y: number;
}

const popularDestinations: Destination[] = [
  {
    id: "reception",
    name: "前台接待",
    icon: Briefcase,
    category: "服务",
    floor: 1,
    location: "1F 大堂正中",
    distance: "85m",
    walkTime: 2,
    x: 200,
    y: 50,
    steps: [
      "从当前位置向西方向出发",
      "走到走廊尽头右转进入主通道",
      "直行约30米到达电梯厅",
      "乘电梯下行至1F",
      "出电梯后左转直行即可到达前台",
    ],
  },
  {
    id: "pantry",
    name: "茶水间",
    icon: Coffee,
    category: "设施",
    floor: 18,
    location: "18F 东南角",
    distance: "45m",
    walkTime: 1,
    x: 320,
    y: 60,
    steps: [
      "从当前位置向东方向出发",
      "沿走廊直行约20米",
      "右侧即是茶水间入口",
    ],
  },
  {
    id: "restroom-m",
    name: "男卫生间",
    icon: Droplets,
    category: "设施",
    floor: 18,
    location: "18F 西南侧",
    distance: "55m",
    walkTime: 1,
    x: 80,
    y: 120,
    steps: [
      "从当前位置向西方向出发",
      "沿走廊直行约15米",
      "左转后直行约10米",
      "右侧即是男卫生间",
    ],
  },
  {
    id: "restroom-f",
    name: "女卫生间",
    icon: Droplets,
    category: "设施",
    floor: 18,
    location: "18F 西南侧",
    distance: "58m",
    walkTime: 1,
    x: 100,
    y: 120,
    steps: [
      "从当前位置向西方向出发",
      "沿走廊直行约15米",
      "左转后直行约12米",
      "左侧即是女卫生间",
    ],
  },
  {
    id: "meeting-A",
    name: "创新厅(会议室)",
    icon: Users,
    category: "会议室",
    floor: 18,
    location: "18F A区",
    distance: "65m",
    walkTime: 2,
    x: 230,
    y: 60,
    steps: [
      "从当前位置向东出发",
      "经过茶水间后继续直行",
      "左侧即是创新厅会议室入口",
    ],
  },
  {
    id: "meeting-B",
    name: "协作间A(会议室)",
    icon: Users,
    category: "会议室",
    floor: 18,
    location: "18F B区",
    distance: "35m",
    walkTime: 1,
    x: 160,
    y: 60,
    steps: [
      "从当前位置向东出发",
      "直行约20米",
      "左侧即是协作间A",
    ],
  },
  {
    id: "printer",
    name: "打印区",
    icon: Printer,
    category: "设施",
    floor: 18,
    location: "18F 中部北侧",
    distance: "30m",
    walkTime: 1,
    x: 200,
    y: 120,
    steps: [
      "从当前位置向北出发",
      "直行约15米",
      "办公区中间位置即是打印区",
    ],
  },
  {
    id: "firstaid",
    name: "急救箱",
    icon: HeartPulse,
    category: "安全",
    floor: 18,
    location: "18F 前台旁",
    distance: "75m",
    walkTime: 2,
    x: 180,
    y: 180,
    steps: [
      "从当前位置向东出发",
      "走到电梯厅区域",
      "前台左侧柜子中有急救箱",
    ],
  },
  {
    id: "stairs",
    name: "疏散楼梯",
    icon: ArrowUpDown,
    category: "安全",
    floor: 18,
    location: "18F 东西两侧",
    distance: "40m",
    walkTime: 1,
    x: 50,
    y: 180,
    steps: [
      "从当前位置向西出发",
      "走到走廊尽头",
      "左侧即是疏散楼梯间入口",
    ],
  },
];

const allFloors = Array.from({ length: 25 }, (_, i) => i + 1);

export default function IndoorNav() {
  const [selectedFloor, setSelectedFloor] = useState(18);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("全部");
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const [showRoute, setShowRoute] = useState(false);

  const categories = ["全部", "服务", "设施", "会议室", "安全"];

  const filteredDestinations = useMemo(() => {
    let result = popularDestinations;
    if (selectedFloor !== 18) {
      result = result.map((d) => ({
        ...d,
        floor: selectedFloor,
        location: `${selectedFloor}F ${d.location.split(" ")[1] || ""}`,
      }));
    }
    if (activeCategory !== "全部") {
      result = result.filter((d) => d.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) => d.name.toLowerCase().includes(q) || d.location.toLowerCase().includes(q)
      );
    }
    return result;
  }, [selectedFloor, activeCategory, searchQuery]);

  const handleSelectDest = (dest: Destination) => {
    setSelectedDest(dest);
    setShowRoute(false);
  };

  const handleStartNavigation = () => {
    setShowRoute(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="室内导航" showBack showSearch />

      <div className="px-4 pt-4 space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索目的地，如：茶水间、会议室..."
            className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
            >
              <X size={12} className="text-gray-500" />
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <MapPin size={18} className="text-primary-500" />
              楼层选择
            </h3>
            <span className="text-xs text-gray-400">当前: {selectedFloor}F</span>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {allFloors.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFloor(f)}
                className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-xl text-sm font-bold transition-all border-2",
                  selectedFloor === f
                    ? "bg-gradient-to-br from-primary-500 to-secondary-500 text-white border-transparent shadow-lg shadow-primary-500/30"
                    : "bg-gray-50 text-gray-600 border-gray-100 hover:border-primary-200 hover:bg-primary-50"
                )}
              >
                {f}F
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Navigation size={18} className="text-secondary-500" />
              {selectedFloor}F 平面图
            </h3>
            {selectedDest && (
              <span className="text-[10px] px-2 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
                已选择: {selectedDest.name}
              </span>
            )}
          </div>

          <div className="rounded-xl bg-gray-50 border border-gray-200 overflow-hidden">
            <svg viewBox="0 0 400 240" className="w-full h-auto">
              <defs>
                <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="0.5" />
                </pattern>
                <linearGradient id="navRoute" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#0EA5E9" />
                </linearGradient>
                <marker id="navArrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#3B82F6" />
                </marker>
              </defs>

              <rect x="0" y="0" width="400" height="240" fill="url(#gridPattern)" />

              <rect x="25" y="25" width="350" height="190" rx="6" fill="white" stroke="#D1D5DB" strokeWidth="1.5" />

              <rect x="40" y="40" width="80" height="55" rx="3" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1" />
              <text x="80" y="72" textAnchor="middle" fontSize="9" fill="#1E40AF" fontWeight="500">办公区A</text>

              <rect x="135" y="40" width="80" height="55" rx="3" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1" />
              <text x="175" y="72" textAnchor="middle" fontSize="9" fill="#1E40AF" fontWeight="500">办公区B</text>

              <rect x="230" y="40" width="70" height="55" rx="3" fill="#FEF3C7" stroke="#FCD34D" strokeWidth="1" />
              <text x="265" y="72" textAnchor="middle" fontSize="9" fill="#B45309" fontWeight="500">会议室</text>

              <rect x="315" y="40" width="50" height="55" rx="3" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="1" />
              <text x="340" y="72" textAnchor="middle" fontSize="8" fill="#15803D" fontWeight="500">茶水间</text>

              <rect x="40" y="110" width="70" height="50" rx="3" fill="#ECFDF5" stroke="#6EE7B7" strokeWidth="1" />
              <text x="75" y="140" textAnchor="middle" fontSize="9" fill="#047857" fontWeight="500">卫生间</text>

              <rect x="315" y="110" width="50" height="50" rx="3" fill="#FEE2E2" stroke="#FCA5A5" strokeWidth="1" />
              <text x="340" y="140" textAnchor="middle" fontSize="8" fill="#B91C1C" fontWeight="500">设备间</text>

              <rect x="155" y="110" width="90" height="50" rx="3" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1" />
              <text x="200" y="140" textAnchor="middle" fontSize="9" fill="#4B5563" fontWeight="500">打印/公共区</text>

              <rect x="40" y="175" width="60" height="30" rx="3" fill="#DCFCE7" stroke="#22C55E" strokeWidth="2" />
              <text x="70" y="194" textAnchor="middle" fontSize="9" fill="#15803D" fontWeight="bold">安全出口</text>

              <rect x="305" y="175" width="60" height="30" rx="3" fill="#DCFCE7" stroke="#22C55E" strokeWidth="2" />
              <text x="335" y="194" textAnchor="middle" fontSize="9" fill="#15803D" fontWeight="bold">安全出口</text>

              <circle cx="145" cy="190" r="16" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
              <text x="145" y="194" textAnchor="middle" fontSize="7" fill="#B45309" fontWeight="bold">梯A</text>

              <circle cx="185" cy="190" r="16" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
              <text x="185" y="194" textAnchor="middle" fontSize="7" fill="#B45309" fontWeight="bold">梯B</text>

              <circle cx="225" cy="190" r="16" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
              <text x="225" y="194" textAnchor="middle" fontSize="7" fill="#B45309" fontWeight="bold">梯C</text>

              <rect x="255" y="180" width="40" height="20" rx="3" fill="#EEF2FF" stroke="#A5B4FC" strokeWidth="1.5" />
              <text x="275" y="193" textAnchor="middle" fontSize="8" fill="#4338CA" fontWeight="600">前台</text>

              <circle cx="100" cy="60" r="10" fill="#3B82F6" stroke="white" strokeWidth="2.5" />
              <circle cx="100" cy="60" r="4" fill="white" />
              <circle cx="100" cy="60" r="16" fill="#3B82F6" opacity="0.15" />

              {showRoute && selectedDest && (
                <>
                  <path
                    d={`M 100 60 L 100 100 L ${selectedDest.x} 100 L ${selectedDest.x} ${selectedDest.y}`}
                    fill="none"
                    stroke="url(#navRoute)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="0"
                    markerEnd="url(#navArrow)"
                  />
                  <circle cx={selectedDest.x} cy={selectedDest.y} r="5" fill="#3B82F6" />
                </>
              )}

              {filteredDestinations
                .filter((d) => d.floor === selectedFloor)
                .map((d) => (
                  <g
                    key={d.id}
                    onClick={() => handleSelectDest(d)}
                    style={{ cursor: "pointer" }}
                    className="transition-all"
                  >
                    <circle
                      cx={d.x}
                      cy={d.y}
                      r={selectedDest?.id === d.id ? 14 : 11}
                      fill={selectedDest?.id === d.id ? "#0EA5E9" : "#94A3B8"}
                      stroke="white"
                      strokeWidth="2"
                      opacity={selectedDest?.id === d.id ? 1 : 0.85}
                    />
                    <circle cx={d.x} cy={d.y} r="3.5" fill="white" />
                    {selectedDest?.id === d.id && (
                      <circle cx={d.x} cy={d.y} r="20" fill="#0EA5E9" opacity="0.15" />
                    )}
                  </g>
                ))}
            </svg>
          </div>

          {selectedDest && (
            <button
              onClick={handleStartNavigation}
              className="w-full mt-3 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 active:opacity-90 transition-opacity shadow-lg shadow-primary-500/25"
            >
              <Footprints size={18} />
              {showRoute ? "重新规划路线" : "开始导航"}
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">常用目的地</h3>
          </div>

          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2 mb-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors",
                  activeCategory === cat
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {filteredDestinations.map((dest) => {
              const Icon = dest.icon;
              const active = selectedDest?.id === dest.id;
              return (
                <button
                  key={dest.id}
                  onClick={() => handleSelectDest(dest)}
                  className={cn(
                    "p-3 rounded-xl text-left transition-all border-2",
                    active
                      ? "bg-primary-50 border-primary-300 shadow-sm"
                      : "bg-gray-50 border-gray-100 hover:border-primary-200 hover:bg-primary-50/50"
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                        active
                          ? "bg-gradient-to-br from-primary-500 to-secondary-500"
                          : "bg-white border border-gray-200"
                      )}
                    >
                      <Icon size={16} className={active ? "text-white" : "text-gray-500"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={cn("font-semibold text-sm mb-0.5 truncate", active ? "text-primary-700" : "text-gray-800")}>
                        {dest.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 truncate">{dest.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 ml-[46px]">
                    <div className="flex items-center gap-1">
                      <MapPin size={11} className="text-gray-400" />
                      <span className="text-[11px] text-gray-500">{dest.distance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={11} className="text-gray-400" />
                      <span className="text-[11px] text-gray-500">{dest.walkTime}分钟</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {showRoute && selectedDest && (
          <div className="bg-white rounded-2xl shadow-lg border border-primary-100 p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  <Footprints size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">前往 {selectedDest.name}</h3>
                  <p className="text-xs text-gray-500">
                    {selectedDest.distance} · 约{selectedDest.walkTime}分钟
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRoute(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-0">
              {selectedDest.steps.map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold",
                        idx === selectedDest.steps.length - 1
                          ? "bg-success-500 text-white"
                          : idx === 0
                          ? "bg-primary-500 text-white"
                          : "bg-primary-100 text-primary-600"
                      )}
                    >
                      {idx === 0 ? (
                        <MapPin size={14} />
                      ) : idx === selectedDest.steps.length - 1 ? (
                        <ChevronRight size={14} />
                      ) : (
                        idx
                      )}
                    </div>
                    {idx < selectedDest.steps.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gradient-to-b from-primary-300 to-primary-100 my-1" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "flex-1 pb-5 pt-0.5",
                      idx === selectedDest.steps.length - 1 ? "pb-0" : ""
                    )}
                  >
                    <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                    {idx < selectedDest.steps.length - 1 && (
                      <div className="flex items-center gap-1 mt-1.5 text-[11px] text-gray-400">
                        <ArrowRight size={10} />
                        <span>继续前行</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2">
              <div className="text-center p-2 rounded-xl bg-primary-50">
                <p className="text-lg font-bold text-primary-600">{selectedDest.distance}</p>
                <p className="text-[10px] text-gray-500">总距离</p>
              </div>
              <div className="text-center p-2 rounded-xl bg-secondary-50">
                <p className="text-lg font-bold text-secondary-600">{selectedDest.walkTime}分</p>
                <p className="text-[10px] text-gray-500">预计时间</p>
              </div>
              <div className="text-center p-2 rounded-xl bg-accent-50">
                <p className="text-lg font-bold text-accent-600">{selectedDest.steps.length}步</p>
                <p className="text-[10px] text-gray-500">指引步骤</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
