import { useState } from "react";
import {
  AlertTriangle,
  Phone,
  MapPin,
  Users,
  Footprints,
  DoorOpen,
  ShieldCheck,
  FileWarning,
  Lightbulb,
  Wind,
  Eye,
  ChevronRight,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

const safetyTips = [
  {
    icon: Footprints,
    title: "使用楼梯逃生",
    desc: "严禁使用电梯，火灾时电梯可能断电或产生烟囱效应",
  },
  {
    icon: Wind,
    title: "低姿匍匐前进",
    desc: "浓烟中贴近地面30cm以下行走，用湿毛巾捂住口鼻",
  },
  {
    icon: DoorOpen,
    title: "关门阻烟",
    desc: "经过的门随手关闭，防止烟雾和火势蔓延",
  },
  {
    icon: Lightbulb,
    title: "开启应急灯",
    desc: "断电时打开手机手电筒，沿应急指示灯方向撤离",
  },
  {
    icon: Eye,
    title: "不贪财物",
    desc: "生命第一，不要折返取财物，尽快撤离到安全区域",
  },
  {
    icon: Users,
    title: "有序不拥挤",
    desc: "靠右行走不推搡，照顾老人和儿童，保持队形",
  },
];

const assemblyPoints = [
  { id: 1, name: "A区集合点", location: "大楼东侧广场", capacity: 300, distance: "步行约2分钟" },
  { id: 2, name: "B区集合点", location: "大楼西侧停车场入口", capacity: 200, distance: "步行约3分钟" },
  { id: 3, name: "C区集合点", location: "对面公园南门", capacity: 500, distance: "步行约5分钟" },
];

export default function Evacuation() {
  const [selectedFloor, setSelectedFloor] = useState(18);
  const [activeAssembly, setActiveAssembly] = useState(1);

  const callEmergency = () => {
    window.location.href = "tel:119";
  };

  const callSecurity = () => {
    window.location.href = "tel:01088888888";
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="应急疏散" showBack />

      <div className="px-4 pt-4 space-y-4">
        <div className="bg-gradient-to-br from-danger-500 via-red-500 to-orange-500 rounded-2xl p-5 shadow-lg shadow-danger-500/25 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center animate-pulse">
                <AlertTriangle size={26} className="text-white" />
              </div>
              <div>
                <h2 className="text-white text-xl font-bold">紧急疏散通道</h2>
                <p className="text-danger-100 text-xs">保持冷静，按指引撤离</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={callEmergency}
                className="flex items-center justify-center gap-2 bg-white rounded-xl py-3.5 active:bg-danger-50 transition-colors"
              >
                <Phone size={20} className="text-danger-500" />
                <span className="text-danger-600 font-bold text-sm">拨打119</span>
              </button>
              <button
                onClick={callSecurity}
                className="flex items-center justify-center gap-2 bg-white/15 backdrop-blur border border-white/30 rounded-xl py-3.5 active:bg-white/25 transition-colors"
              >
                <ShieldCheck size={20} className="text-white" />
                <span className="text-white font-bold text-sm">联系安保</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <MapPin size={18} className="text-primary-500" />
              疏散路线图
            </h3>
            <div className="text-xs text-gray-400">{selectedFloor}F 平面图</div>
          </div>

          <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-hide pb-1">
            {[18, 19, 20, 21, 22, 23, 24, 25].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFloor(f)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedFloor === f
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f}F
              </button>
            ))}
          </div>

          <div className="rounded-xl bg-gray-50 border border-gray-200 overflow-hidden">
            <svg viewBox="0 0 400 260" className="w-full h-auto">
              <defs>
                <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="100%" stopColor="#F97316" />
                </linearGradient>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#EF4444" />
                </marker>
              </defs>

              <rect x="20" y="30" width="360" height="200" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1.5" />

              <rect x="40" y="50" width="70" height="60" rx="4" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1" />
              <text x="75" y="85" textAnchor="middle" fontSize="10" fill="#1E40AF" fontWeight="500">办公区A</text>

              <rect x="125" y="50" width="70" height="60" rx="4" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1" />
              <text x="160" y="85" textAnchor="middle" fontSize="10" fill="#1E40AF" fontWeight="500">办公区B</text>

              <rect x="210" y="50" width="70" height="60" rx="4" fill="#FEF3C7" stroke="#FCD34D" strokeWidth="1" />
              <text x="245" y="85" textAnchor="middle" fontSize="10" fill="#B45309" fontWeight="500">会议室</text>

              <rect x="295" y="50" width="70" height="60" rx="4" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="1" />
              <text x="330" y="85" textAnchor="middle" fontSize="10" fill="#15803D" fontWeight="500">茶水间</text>

              <rect x="40" y="125" width="80" height="50" rx="4" fill="#ECFDF5" stroke="#6EE7B7" strokeWidth="1" />
              <text x="80" y="155" textAnchor="middle" fontSize="10" fill="#047857" fontWeight="500">卫生间</text>

              <rect x="295" y="125" width="70" height="50" rx="4" fill="#FEE2E2" stroke="#FCA5A5" strokeWidth="1" />
              <text x="330" y="155" textAnchor="middle" fontSize="10" fill="#B91C1C" fontWeight="500">设备间</text>

              <circle cx="155" cy="195" r="20" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
              <text x="155" y="199" textAnchor="middle" fontSize="9" fill="#B45309" fontWeight="bold">电梯</text>

              <circle cx="210" cy="195" r="20" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
              <text x="210" y="199" textAnchor="middle" fontSize="9" fill="#B45309" fontWeight="bold">电梯</text>

              <rect x="55" y="185" width="70" height="30" rx="4" fill="#DCFCE7" stroke="#22C55E" strokeWidth="2.5" />
              <text x="90" y="204" textAnchor="middle" fontSize="11" fill="#15803D" fontWeight="bold">安全出口</text>

              <rect x="305" y="185" width="70" height="30" rx="4" fill="#DCFCE7" stroke="#22C55E" strokeWidth="2.5" />
              <text x="340" y="204" textAnchor="middle" fontSize="11" fill="#15803D" fontWeight="bold">安全出口</text>

              <circle cx="75" cy="50" r="8" fill="#EF4444" stroke="white" strokeWidth="2" />
              <text x="75" y="53" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">起</text>

              <path
                d="M 80 60 L 80 175 L 90 185"
                fill="none"
                stroke="url(#routeGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="8 4"
                markerEnd="url(#arrowhead)"
              />

              <path
                d="M 80 90 L 155 90 L 180 90 L 250 90 L 330 90 L 340 175 L 340 185"
                fill="none"
                stroke="url(#routeGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="6 3"
                opacity="0.6"
                markerEnd="url(#arrowhead)"
              />

              <g transform="translate(20, 240)">
                <rect x="0" y="0" width="12" height="12" rx="2" fill="#DCFCE7" stroke="#22C55E" strokeWidth="1.5" />
                <text x="18" y="10" fontSize="10" fill="#6B7280">安全出口</text>
                <rect x="80" y="0" width="12" height="12" rx="6" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="98" y="10" fontSize="10" fill="#6B7280">电梯</text>
                <line x1="170" y1="6" x2="200" y2="6" stroke="url(#routeGrad)" strokeWidth="3" strokeDasharray="6 3" />
                <text x="206" y="10" fontSize="10" fill="#6B7280">疏散路线</text>
              </g>
            </svg>
          </div>

          <div className="mt-3 p-3 bg-danger-50 rounded-xl border border-danger-100">
            <div className="flex items-start gap-2">
              <FileWarning size={16} className="text-danger-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-danger-700 leading-relaxed">
                当前楼层{selectedFloor}F共有 <span className="font-bold">2个安全出口</span>，建议优先选择
                <span className="font-bold">西侧安全出口</span>撤离，距离最近。预计步行约2分钟到达地面。
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
            <Users size={18} className="text-secondary-500" />
            集合点说明
          </h3>

          <div className="space-y-2.5">
            {assemblyPoints.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveAssembly(p.id)}
                className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${
                  activeAssembly === p.id
                    ? "border-secondary-400 bg-secondary-50"
                    : "border-gray-100 bg-gray-50 hover:border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        activeAssembly === p.id ? "bg-secondary-500" : "bg-gray-200"
                      }`}
                    >
                      <MapPin size={18} className={activeAssembly === p.id ? "text-white" : "text-gray-500"} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className={`font-semibold text-sm ${activeAssembly === p.id ? "text-secondary-700" : "text-gray-800"}`}>
                          {p.name}
                        </h4>
                        {activeAssembly === p.id && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-secondary-500 text-white rounded-full">推荐</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{p.location}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className={activeAssembly === p.id ? "text-secondary-500" : "text-gray-400"} />
                </div>
                <div className="flex items-center gap-4 mt-2.5 ml-13 pl-13">
                  <span className="text-[11px] text-gray-500">容纳 {p.capacity} 人</span>
                  <span className="text-[11px] text-gray-500">{p.distance}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
            <ShieldCheck size={18} className="text-success-500" />
            安全须知
          </h3>

          <div className="grid grid-cols-1 gap-2.5">
            {safetyTips.map((tip, idx) => {
              const Icon = tip.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-800 mb-0.5">{tip.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-r from-danger-600 via-red-600 to-danger-700 rounded-2xl p-5 shadow-xl shadow-danger-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Phone size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">紧急联系电话</h3>
              <p className="text-danger-100 text-xs">24小时应急响应</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={callEmergency}
              className="flex items-center justify-between bg-white rounded-xl py-3 px-4 active:bg-danger-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-danger-500" />
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-800">消防报警</p>
                  <p className="text-xs text-gray-500">火灾、紧急救援</p>
                </div>
              </div>
              <span className="text-danger-500 font-bold text-lg">119</span>
            </button>
            <button
              onClick={callSecurity}
              className="flex items-center justify-between bg-white/15 backdrop-blur border border-white/25 rounded-xl py-3 px-4 active:bg-white/25 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-white" />
                <div className="text-left">
                  <p className="text-sm font-bold text-white">安保中心</p>
                  <p className="text-xs text-danger-100">楼宇安保值班</p>
                </div>
              </div>
              <span className="text-white font-bold">010-8888-8888</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
