import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Wrench,
  Plus,
  MapPin,
  Clock,
  Circle,
  Check,
  Loader,
  CheckCircle,
  X,
  Thermometer,
  Lightbulb,
  Wifi,
  Droplets,
  MoreHorizontal,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { repairCategories, useRepairStore } from "@/store/useRepairStore";
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

const iconMap: Record<string, React.ReactNode> = {
  Wrench: <Wrench size={24} />,
  Thermometer: <Thermometer size={24} />,
  Lightbulb: <Lightbulb size={24} />,
  Wifi: <Wifi size={24} />,
  Droplets: <Droplets size={24} />,
  MoreHorizontal: <MoreHorizontal size={24} />,
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
  const location = useLocation();
  const { orders } = useRepairStore();
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(
    (location.state as any)?.highlightId || null
  );
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  useEffect(() => {
    if (highlightId) {
      setTimeout(() => {
        const el = cardRefs.current[highlightId];
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 200);

      const timer = setTimeout(() => {
        setHighlightId(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [highlightId]);

  const handleCategorySelect = (catId: string) => {
    setShowCategorySheet(false);
    setTimeout(() => {
      navigate(`/repair/submit?category=${catId}`, {
        state: { fromList: true },
      });
    }, 200);
  };

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
            {filteredOrders.map((order) => {
              const isHighlight = order.id === highlightId;
              return (
                <div
                  key={order.id}
                  ref={(el) => (cardRefs.current[order.id] = el)}
                  id={`order-${order.id}`}
                  onClick={() => navigate(`/repair/${order.id}`)}
                  className={cn(
                    "bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.99]",
                    isHighlight &&
                      "ring-2 ring-primary-400 bg-primary-50 animate-pulse"
                  )}
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
              );
            })}
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
        onClick={() => setShowCategorySheet(true)}
        className="fixed right-5 bottom-24 w-14 h-14 rounded-full bg-primary-500 text-white shadow-lg shadow-primary-300/50 flex items-center justify-center hover:bg-primary-600 active:bg-primary-700 transition-all z-50 active:scale-95"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {showCategorySheet && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 animate-fade-in"
          onClick={() => setShowCategorySheet(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-3xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">选择报修类型</h3>
              <button
                onClick={() => setShowCategorySheet(false)}
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-3 gap-3">
                {repairCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all flex flex-col items-center gap-2 active:scale-95"
                  >
                    <div
                      className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center",
                        cat.color
                      )}
                    >
                      {iconMap[cat.icon]}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 pb-8 pt-2">
              <button
                onClick={() => setShowCategorySheet(false)}
                className="w-full py-3 rounded-xl text-gray-600 text-sm font-medium bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
