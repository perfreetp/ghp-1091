import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, User as UserIcon, Clock, Share2, Phone, Car, Calendar } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { useVisitorStore } from "@/store/useVisitorStore";
import { formatPhone } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { VisitorReservation } from "@/types";

type TabKey = "pending" | "history";

const TABS: { key: TabKey; label: string }[] = [
  { key: "pending", label: "待来访" },
  { key: "history", label: "历史记录" },
];

const STATUS_CONFIG: Record<VisitorReservation["status"], { label: string; className: string }> = {
  pending: { label: "待来访", className: "bg-primary-500/10 text-primary-700" },
  arrived: { label: "已到访", className: "bg-success-500/10 text-success-600" },
  left: { label: "已离开", className: "bg-gray-500/10 text-gray-600" },
  cancelled: { label: "已取消", className: "bg-danger-500/10 text-danger-600" },
};

export default function Visitor() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const { visitors } = useVisitorStore();

  const pendingVisitors = visitors.filter((v) => v.status === "pending" || v.status === "arrived");
  const historyVisitors = visitors.filter((v) => v.status === "left" || v.status === "cancelled");

  const list = activeTab === "pending" ? pendingVisitors : historyVisitors;

  const handleShare = (visitor: VisitorReservation) => {
    const text = `【智慧楼宇访客邀请】\n访客姓名：${visitor.visitorName}\n到访时间：${visitor.visitTime}\n到访码：${visitor.visitCode}\n请凭到访码进入楼宇`;
    if (navigator.share) {
      navigator.share({ title: "访客到访码", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        alert("到访码信息已复制到剪贴板");
      }).catch(() => {
        alert(`到访码：${visitor.visitCode}`);
      });
    }
  };

  const renderVisitorCard = (visitor: VisitorReservation) => {
    const statusConfig = STATUS_CONFIG[visitor.status];
    const showShare = visitor.status === "pending";
    const avatarSeed = encodeURIComponent(visitor.visitorName);

    return (
      <div key={visitor.id} className="card card-hover p-4 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
              alt={visitor.visitorName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <UserIcon size={26} className="text-primary-700 absolute" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{visitor.visitorName}</p>
                <span className={cn("badge", statusConfig.className)}>
                  {statusConfig.label}
                </span>
              </div>
            </div>

            <div className="mt-2 space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={14} className="text-gray-400 flex-shrink-0" />
                <span>{formatPhone(visitor.visitorPhone)}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                <span>{visitor.visitTime}</span>
                {visitor.leaveTime && (
                  <span className="text-gray-400">~ {visitor.leaveTime}</span>
                )}
              </div>

              {visitor.plateNumber && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Car size={14} className="text-gray-400 flex-shrink-0" />
                  <span>车牌：{visitor.plateNumber}</span>
                </div>
              )}

              <div className="flex items-start gap-2 text-gray-500 text-xs">
                <span className="bg-gray-100 px-2 py-0.5 rounded-md">{visitor.purpose}</span>
                {visitor.visitCode && activeTab === "pending" && (
                  <span className="bg-primary-700 text-white px-2 py-0.5 rounded-md font-mono tracking-wider">
                    {visitor.visitCode}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {showShare && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <Clock size={12} />
              预约于 {visitor.createTime}
            </div>
            <button
              onClick={() => handleShare(visitor)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-50 text-primary-700 text-sm font-medium hover:bg-primary-100 transition-colors active:scale-95"
            >
              <Share2 size={16} />
              分享到访码
            </button>
          </div>
        )}

        {!showShare && visitor.createTime && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-1">
            <Clock size={12} />
            创建于 {visitor.createTime}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app-container pb-safe-bottom">
      <PageHeader title="访客" showBell />

      <div className="sticky top-14 z-30 bg-white border-b border-gray-100">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors relative",
                activeTab === tab.key ? "tab-active" : "tab-inactive"
              )}
            >
              {tab.label}
              {tab.key === "pending" && pendingVisitors.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-danger-500 text-white text-xs font-semibold">
                  {pendingVisitors.length > 99 ? "99+" : pendingVisitors.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {list.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <UserIcon size={48} className="mx-auto mb-4 opacity-40" />
            <p className="text-sm">
              {activeTab === "pending" ? "暂无待来访的访客" : "暂无历史访客记录"}
            </p>
            {activeTab === "pending" && (
              <button
                onClick={() => navigate("/visitor/reserve")}
                className="mt-4 text-primary-700 text-sm font-medium hover:text-primary-800"
              >
                + 立即预约访客
              </button>
            )}
          </div>
        ) : (
          list.map(renderVisitorCard)
        )}
      </div>

      <button
        onClick={() => navigate("/visitor/reserve")}
        className="fixed right-5 bottom-24 w-14 h-14 rounded-full gradient-primary shadow-xl shadow-primary-800/40 flex items-center justify-center text-white z-40 hover:scale-105 active:scale-95 transition-transform animate-fade-in"
        aria-label="预约访客"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>
    </div>
  );
}
