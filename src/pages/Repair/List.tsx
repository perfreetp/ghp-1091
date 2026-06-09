import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  Plus,
  MapPin,
  Clock,
  Circle,
  Check,
  Loader,
  CheckCircle,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { useRepairStore } from "@/store/useRepairStore";
import { getStatusText } from "@/utils/format";
import { cn } from "@/lib/utils";

const statusColorMap: Record<string, string> = {
  submitted: "bg-blue-500",
  accepted: "bg-cyan-500",
  processing: "bg-orange-500",
  completed: "bg-green-500",
  evaluated: "bg-purple-500",
};

const statusDotMap: Record<string, React.ReactNode> = {
  submitted: <Circle size={12} className="fill-current" />,
  accepted: <Check size={12} />,
  processing: <Loader size={12} className="animate-spin" />,
  completed: <CheckCircle size={12} />,
  evaluated: <CheckCircle size={12} />,
};

type TabKey = "all" | "processing" | "completed";

const tabs: { key: TabKey; label: string; filter: (status: string) => boolean }[] = [
  { key: "all", label: "全部", filter: () => true },
  {
    key: "processing",
    label: "处理中",
    filter: (s) => ["submitted", "accepted", "processing"].includes(s),
  },
  {
    key: "completed",
    label: "已完成",
    filter: (s) => ["completed", "evaluated"].includes(s),
  },
];

export default function RepairList() {
  const navigate = useNavigate();
  const { orders } = useRepairStore();
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) =>
          new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
      ),
    [orders]
  );

  const filteredOrders = useMemo(
    () =>
      sortedOrders.filter((o) =>
        tabs.find((t) => t.key === activeTab)!.filter(o.status)
      ),
    [sortedOrders, activeTab]
  );

  const getTabCount = (key: TabKey) =>
    sortedOrders.filter((o) => tabs.find((t) => t.key === key)!.filter(o.status))
      .length;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <PageHeader title="报修记录" showBack />

      <div className="sticky top-14 z-30 bg-gray-50 px-4 pt-3 pb-2">
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm">
          {tabs.map((tab) => {
            const count = getTabCount(tab.key);
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1",
                  isActive
                    ? "bg-primary-500 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-medium",
                    isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-3">
        {filteredOrders.length > 0 ? (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/repair/${order.id}`)}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">
                      {order.id}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white",
                      statusColorMap[order.status]
                    )}
                  >
                    {statusDotMap[order.status]}
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                    {order.category}
                  </span>
                </div>

                <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                  {order.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span className="line-clamp-1">{order.location}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <Clock size={12} />
                    <span>{order.updateTime.slice(5, 16)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench size={36} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400 mb-1">暂无报修记录</p>
            <p className="text-xs text-gray-300">点击右下角按钮提交报修</p>
          </div>
        )}
      </div>

      <button
        onClick={() => navigate("/repair/submit")}
        className="fixed right-5 bottom-24 w-14 h-14 rounded-full bg-primary-500 text-white shadow-lg shadow-primary-300/50 flex items-center justify-center hover:bg-primary-600 active:bg-primary-700 transition-all z-50 active:scale-95"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>
    </div>
  );
}
