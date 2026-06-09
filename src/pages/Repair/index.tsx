import { useNavigate } from "react-router-dom";
import {
  Wrench,
  Thermometer,
  Lightbulb,
  Wifi,
  Droplets,
  MoreHorizontal,
  ThermometerSun,
  ChevronRight,
  Clock,
  CheckCircle,
  Circle,
  Loader,
  Check,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { repairCategories, useRepairStore } from "@/store/useRepairStore";
import { getStatusText } from "@/utils/format";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ReactNode> = {
  Wrench: <Wrench size={24} />,
  Thermometer: <Thermometer size={24} />,
  Lightbulb: <Lightbulb size={24} />,
  Wifi: <Wifi size={24} />,
  Droplets: <Droplets size={24} />,
  MoreHorizontal: <MoreHorizontal size={24} />,
};

const timelineSteps = [
  { key: "submitted", label: "已提交" },
  { key: "accepted", label: "已受理" },
  { key: "processing", label: "处理中" },
  { key: "completed", label: "已完成" },
  { key: "evaluated", label: "已评价" },
];

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

export default function RepairIndex() {
  const navigate = useNavigate();
  const { orders } = useRepairStore();

  const getTimelineIndex = (status: string) => {
    const idx = timelineSteps.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const displayOrders = [...orders]
    .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <PageHeader title="报修服务" showBell />

      <div className="px-4 pt-4">
        <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl p-5 shadow-lg shadow-primary-200/50 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ThermometerSun size={20} />
                <h2 className="text-lg font-semibold">舒适度反馈</h2>
              </div>
              <p className="text-xs text-white/80 text-sm mt-1">
                调节环境温度、照明亮度，让办公更舒适
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/repair/comfort")}
            className="w-full py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white text-sm font-medium hover:bg-white/30 active:bg-white/35 transition-colors flex items-center justify-center gap-1"
          >
            立即反馈
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-5">
        <h2 className="text-base font-semibold text-gray-800 mb-3">报修分类</h2>
        <div className="grid grid-cols-3 gap-3">
          {repairCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                navigate(`/repair/submit?category=${cat.id}`)
              }
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
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

      <div className="px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800">报修进度</h2>
          <button
            onClick={() => navigate("/repair/list")}
            className="text-xs text-primary-500 font-medium"
          >
            查看全部
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          {displayOrders.length > 0 ? (
            <div className="space-y-6">
              {displayOrders.map((order, orderIndex) => {
                const currentStepIndex = getTimelineIndex(order.status);
                return (
                  <div
                    key={order.id}
                    onClick={() => navigate(`/repair/${order.id}`)}
                    className={cn(
                      "relative cursor-pointer hover:opacity-80 active:opacity-70 transition-opacity",
                      orderIndex < displayOrders.length - 1 && "pb-2"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-white",
                            statusColorMap[order.status]
                          )}
                        >
                          {statusDotMap[order.status]}
                        </div>
                        {orderIndex < displayOrders.length - 1 && (
                          <div className="w-0.5 flex-1 bg-gray-200 my-1" style={{ minHeight: 40 }} />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white",
                                statusColorMap[order.status]
                              )}
                            >
                              {getStatusText(order.status)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {order.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock size={10} />
                            {order.updateTime.slice(5, 16)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mt-1 line-clamp-1">
                          {order.description}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                          {order.location}
                        </div>

                        <div className="mt-2 flex items-center gap-1">
                          {timelineSteps.map((step, idx) => {
                            const isActive = idx <= currentStepIndex;
                            const isCurrent = idx === currentStepIndex;
                            return (
                              <div key={step.key} className="flex items-center flex-1 last:flex-none">
                                <div
                                  className={cn(
                                    "w-2 h-2 rounded-full transition-all",
                                    isActive
                                      ? statusColorMap[order.status]
                                      : "bg-gray-200"
                                  )}
                                />
                                <span
                                  className={cn(
                                    "ml-1 text-[10px]",
                                    isActive ? "text-gray-600" : "text-gray-400"
                                  )}
                                >
                                  {step.label}
                                </span>
                                {idx < timelineSteps.length - 1 && (
                                  <div
                                    className={cn(
                                      "flex-1 h-0.5 mx-1 rounded-full",
                                      idx < currentStepIndex
                                        ? statusColorMap[order.status]
                                        : "bg-gray-100"
                                    )}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wrench size={24} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-400">暂无报修记录</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
