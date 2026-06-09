import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  User,
  Calendar,
  Circle,
  Check,
  Loader,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { useRepairStore } from "@/store/useRepairStore";
import { getStatusText } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { RepairOrder } from "@/types";

const statusColorMap: Record<string, string> = {
  submitted: "bg-blue-500",
  accepted: "bg-cyan-500",
  processing: "bg-orange-500",
  completed: "bg-green-500",
  evaluated: "bg-purple-500",
};

const statusBgMap: Record<string, string> = {
  submitted: "bg-blue-500/10",
  accepted: "bg-cyan-500/10",
  processing: "bg-orange-500/10",
  completed: "bg-green-500/10",
  evaluated: "bg-purple-500/10",
};

const statusTextColorMap: Record<string, string> = {
  submitted: "text-blue-600",
  accepted: "text-cyan-600",
  processing: "text-orange-600",
  completed: "text-green-600",
  evaluated: "text-purple-600",
};

const statusDotMap: Record<string, React.ReactNode> = {
  submitted: <Circle size={14} className="fill-current" />,
  accepted: <Check size={14} />,
  processing: <Loader size={14} className="animate-spin" />,
  completed: <CheckCircle size={14} />,
  evaluated: <CheckCircle size={14} />,
};

const addHours = (dateStr: string, hours: number): string => {
  const date = new Date(dateStr.replace(" ", "T"));
  date.setHours(date.getHours() + hours);
  return date.toISOString().slice(0, 16).replace("T", " ");
};

interface TimelineStep {
  key: string;
  label: string;
  handler: (order: RepairOrder) => string;
  time: (order: RepairOrder) => string;
  show: (order: RepairOrder) => boolean;
}

const timelineSteps: TimelineStep[] = [
  {
    key: "submitted",
    label: "已提交",
    handler: () => "系统",
    time: (o) => o.createTime,
    show: () => true,
  },
  {
    key: "accepted",
    label: "已受理",
    handler: () => "王师傅",
    time: (o) => addHours(o.createTime, 1),
    show: (o) =>
      ["accepted", "processing", "completed", "evaluated"].includes(o.status),
  },
  {
    key: "processing",
    label: "处理中",
    handler: () => "李工程师",
    time: (o) => addHours(o.createTime, 4),
    show: (o) =>
      ["processing", "completed", "evaluated"].includes(o.status),
  },
  {
    key: "completed",
    label: "已完成",
    handler: () => "李工程师",
    time: (o) => addHours(o.createTime, 24),
    show: (o) => ["completed", "evaluated"].includes(o.status),
  },
  {
    key: "evaluated",
    label: "已评价",
    handler: () => "张明（自己）",
    time: (o) => addHours(o.createTime, 48),
    show: (o) => o.status === "evaluated",
  },
];

export default function RepairDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, updateOrder } = useRepairStore();
  const order = orders.find((o) => o.id === id);

  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const getTimelineIndex = (status: string) => {
    const visibleSteps = timelineSteps.filter((s) => s.show(order!));
    const idx = visibleSteps.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : visibleSteps.length - 1;
  };

  const handleCancel = () => {
    if (!order) return;
    updateOrder(order.id, { status: "cancelled" as any });
    navigate(-1);
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="报修详情" showBack />
        <div className="p-8 text-center text-gray-400">报修单不存在</div>
      </div>
    );
  }

  const visibleSteps = timelineSteps.filter((s) => s.show(order));
  const currentStepIndex = getTimelineIndex(order.status);
  const canCancel = ["submitted", "accepted", "processing"].includes(order.status);

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <PageHeader title="报修详情" showBack />

      <div className="px-4 pt-4">
        <div
          className={cn(
            "rounded-2xl p-5 shadow-sm border",
            statusBgMap[order.status],
            "border-transparent"
          )}
        >
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-md",
                statusColorMap[order.status]
              )}
            >
              {statusDotMap[order.status]}
            </div>
            <div className="flex-1">
              <div
                className={cn(
                  "text-lg font-bold mb-1",
                  statusTextColorMap[order.status]
                )}
              >
                {getStatusText(order.status)}
              </div>
              <div className="text-sm font-semibold text-gray-800 mb-0.5">
                {order.id}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/50 flex gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User size={14} className={statusTextColorMap[order.status]} />
              <span>{order.reporter}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={14} className={statusTextColorMap[order.status]} />
              <span>{order.createTime}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <div>
            <span className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium">
              {order.category}
            </span>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1.5">报修描述</div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {order.description}
            </p>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1.5">报修位置</div>
            <div className="flex items-center gap-1.5 text-sm text-gray-700">
              <MapPin size={14} className="text-primary-500" />
              <span>{order.location}</span>
            </div>
          </div>
        </div>
      </div>

      {order.images && order.images.length > 0 && (
        <div className="px-4 pt-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-xs text-gray-400 mb-3">现场图片</div>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
              {order.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setPreviewIndex(idx)}
                  className="flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
                >
                  <img
                    src={img}
                    alt={`图片${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-sm font-semibold text-gray-800 mb-4">
            处理进度
          </div>
          <div className="relative">
            {visibleSteps.map((step, idx) => {
              const isActive = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const isLast = idx === visibleSteps.length - 1;
              return (
                <div key={step.key} className="relative flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-white z-10 transition-all",
                        isActive
                          ? statusColorMap[order.status]
                          : "bg-gray-200 text-gray-400",
                        isCurrent && "ring-4 ring-offset-2",
                        isCurrent && statusColorMap[order.status].replace("bg-", "ring-").replace("-500", "-100")
                      )}
                    >
                      {idx < currentStepIndex ? (
                        <Check size={18} />
                      ) : (
                        statusDotMap[step.key] || <Circle size={14} />
                      )}
                    </div>
                    {!isLast && (
                      <div
                        className={cn(
                          "w-0.5 flex-1 my-1",
                          idx < currentStepIndex
                            ? statusColorMap[order.status]
                            : "bg-gray-200"
                        )}
                        style={{ minHeight: 36 }}
                      />
                    )}
                  </div>
                  <div
                    className={cn(
                      "flex-1 pb-6",
                      isLast && "pb-0"
                    )}
                  >
                    <div
                      className={cn(
                        "text-sm font-semibold mb-0.5",
                        isActive ? "text-gray-800" : "text-gray-400"
                      )}
                    >
                      {step.label}
                    </div>
                    <div
                      className={cn(
                        "text-xs mb-0.5",
                        isActive ? "text-gray-600" : "text-gray-300"
                      )}
                    >
                      处理人：{step.handler(order)}
                    </div>
                    <div
                      className={cn(
                        "text-xs",
                        isActive ? "text-gray-400" : "text-gray-300"
                      )}
                    >
                      {step.time(order)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {previewIndex !== null &&
        order.images &&
        order.images.length > 0 && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setPreviewIndex(null)}
          >
            <button
              onClick={() => setPreviewIndex(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X size={24} />
            </button>
            {previewIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewIndex((i) => (i! - 1 + order.images!.length) % order.images!.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <img
              src={order.images[previewIndex]}
              alt={`图片${previewIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {previewIndex < order.images.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewIndex((i) => (i! + 1) % order.images!.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            )}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 text-sm">
              {previewIndex + 1} / {order.images.length}
            </div>
          </div>
        )}

      {canCancel && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 px-4 py-3 z-40">
          <div className="max-w-lg mx-auto">
            <button
              onClick={handleCancel}
              className="w-full py-3 rounded-xl text-white text-sm font-medium bg-primary-500 hover:bg-primary-600 active:bg-primary-700 shadow-md shadow-primary-200 transition-all"
            >
              撤销报修
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
