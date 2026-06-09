import { useState, useRef, useEffect } from "react";
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
  Megaphone,
  Star,
  MessageSquare,
  Image as ImageIcon,
  Send,
  Camera,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { useRepairStore } from "@/store/useRepairStore";
import { getStatusText } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { RepairOrder, CommunicationMessage } from "@/types";

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
    time: (o) => o.evaluatedTime || addHours(o.createTime, 48),
    show: (o) => o.status === "evaluated",
  },
];

const renderStars = (rating: number, size: number = 20) => {
  return Array.from({ length: 5 }).map((_, i) => (
    <Star
      key={i}
      size={size}
      className={cn(
        i < rating ? "text-warning-500 fill-warning-500" : "text-gray-300"
      )}
    />
  ));
};

export default function RepairDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, updateOrder, urgeOrder, evaluateOrder, completeOrder, addCommunication } = useRepairStore();
  const [refreshKey, setRefreshKey] = useState(0);
  const order = orders.find((o) => o.id === id);

  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [previewCommImages, setPreviewCommImages] = useState<{ images: string[]; index: number } | null>(null);
  const [confirmUrge, setConfirmUrge] = useState(false);
  const [rating, setRating] = useState(0);
  const [evaluation, setEvaluation] = useState("");
  const [submittingEval, setSubmittingEval] = useState(false);
  const [commContent, setCommContent] = useState("");
  const [commImages, setCommImages] = useState<string[]>([]);
  const commEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    commEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [order?.communications?.length, refreshKey]);

  const handleCommImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 3 - commImages.length;
    const toProcess = Array.from(files).slice(0, remaining);
    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (result) {
          setCommImages((prev) => [...prev, result].slice(0, 3));
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleRemoveCommImage = (idx: number) => {
    setCommImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSendComm = () => {
    if (!order) return;
    const trimmed = commContent.trim();
    if (!trimmed && commImages.length === 0) return;
    addCommunication(order.id, {
      sender: "user",
      senderName: "张明",
      content: trimmed,
      images: commImages.length > 0 ? [...commImages] : undefined,
    });
    setCommContent("");
    setCommImages([]);
    setTimeout(() => setRefreshKey((k) => k + 1), 3100);
  };

  const handleComplete = () => {
    if (!order) return;
    if (confirm("确认标记此工单为维修完成？")) {
      completeOrder(order.id);
      setRefreshKey((k) => k + 1);
    }
  };

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

  const handleUrge = () => {
    if (!order) return;
    urgeOrder(order.id);
    setConfirmUrge(false);
    setRefreshKey((k) => k + 1);
  };

  const handleSubmitEvaluation = () => {
    if (!order) return;
    if (rating === 0) {
      alert("请先打分");
      return;
    }
    setSubmittingEval(true);
    setTimeout(() => {
      evaluateOrder(order.id, rating, evaluation.trim());
      setSubmittingEval(false);
      setRefreshKey((k) => k + 1);
    }, 500);
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
  const canCancelOrUrge = ["submitted", "accepted", "processing"].includes(order.status);
  const showEvaluationForm = order.status === "completed";
  const showEvaluatedCard = order.status === "evaluated";
  const urgeCount = order.urgeCount || 0;

  return (
    <div
      key={refreshKey}
      className="min-h-screen bg-gray-50 pb-28"
    >
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
              const log = order.timelineLogs?.find((l) => l.status === step.key);
              const handler = log ? log.handler : step.handler(order);
              const time = log ? log.time : step.time(order);
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
                      处理人：{handler}
                    </div>
                    <div
                      className={cn(
                        "text-xs",
                        isActive ? "text-gray-400" : "text-gray-300"
                      )}
                    >
                      {time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {["submitted", "accepted", "processing", "completed"].includes(order.status) && (
        <div className="px-4 pt-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MessageSquare size={16} className="text-primary-500" />
              <span>维修沟通</span>
            </div>

            <div className="space-y-4 mb-4 max-h-80 overflow-y-auto pr-1 -mr-1">
              {(order.communications || []).length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  暂无沟通记录，有问题可给维修人员留言~
                </div>
              ) : (
                (order.communications || []).map((msg: CommunicationMessage) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div
                      key={msg.id}
                      className={cn("flex gap-2.5", isUser ? "flex-row-reverse" : "flex-row")}
                    >
                      <div
                        className={cn(
                          "w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold",
                          isUser ? "bg-primary-500" : "bg-cyan-500"
                        )}
                      >
                        {msg.senderName.slice(0, 1)}
                      </div>
                      <div
                        className={cn(
                          "flex flex-col gap-1 max-w-[75%]",
                          isUser ? "items-end" : "items-start"
                        )}
                      >
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                          <span>{msg.senderName}</span>
                          <span>{msg.time.slice(-5)}</span>
                        </div>
                        {msg.content && (
                          <div
                            className={cn(
                              "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                              isUser
                                ? "bg-primary-500 text-white rounded-tr-md"
                                : "bg-gray-100 text-gray-800 rounded-tl-md"
                            )}
                          >
                            {msg.content}
                          </div>
                        )}
                        {msg.images && msg.images.length > 0 && (
                          <div
                            className={cn(
                              "grid grid-cols-3 gap-1.5 mt-1",
                              isUser ? "justify-items-end" : "justify-items-start"
                            )}
                            style={{
                              gridTemplateColumns: `repeat(${Math.min(msg.images.length, 3)}, 64px)`,
                            }}
                          >
                            {msg.images.map((img, i) => (
                              <button
                                key={i}
                                onClick={() =>
                                  setPreviewCommImages({ images: msg.images!, index: i })
                                }
                                className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
                              >
                                <img
                                  src={img}
                                  alt={`图片${i + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={commEndRef} />
            </div>

            {["submitted", "accepted", "processing"].includes(order.status) && (
              <div className="border-t border-gray-100 pt-4">
                {commImages.length > 0 && (
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {commImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100"
                      >
                        <img
                          src={img}
                          alt={`预览${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleRemoveCommImage(idx)}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-700/80 text-white text-xs flex items-center justify-center hover:bg-gray-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={commContent}
                      onChange={(e) => setCommContent(e.target.value.slice(0, 200))}
                      placeholder="补充说明故障情况、上传更多照片..."
                      rows={2}
                      className="w-full p-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all"
                    />
                    <div className="absolute right-2 bottom-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={commImages.length >= 3}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                          commImages.length >= 3
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-400 hover:text-primary-500 hover:bg-primary-50"
                        )}
                      >
                        <Camera size={18} />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleCommImageUpload}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSendComm}
                    disabled={!commContent.trim() && commImages.length === 0}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                      !commContent.trim() && commImages.length === 0
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "gradient-primary text-white shadow-md shadow-primary-800/20 hover:opacity-95 active:scale-95"
                    )}
                  >
                    <Send size={18} />
                  </button>
                </div>
                <div className="mt-1 text-right text-xs text-gray-400">
                  {commContent.length}/200
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showEvaluatedCard && (
        <div className="px-4 pt-4 pb-20">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base font-bold text-gray-800">感谢您的评价！</span>
              <div className="flex items-center gap-0.5">
                {renderStars(order.rating || 0, 16)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-3">
              <p className="text-sm text-gray-700 leading-relaxed">
                {order.evaluation || "暂无评价内容"}
              </p>
            </div>
            <div className="text-xs text-gray-400">
              评价时间：{order.evaluatedTime}
            </div>
          </div>
        </div>
      )}

      {showEvaluationForm && (
        <div className="px-4 pt-4 pb-20">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>服务评价</span>
              <span className="text-xl">🎉</span>
            </h3>

            <div className="mb-5">
              <div className="text-sm text-gray-600 mb-2">请为本次服务打分</div>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setRating(i + 1)}
                    className="p-1 rounded-lg hover:bg-gray-50 active:scale-95 transition-all"
                  >
                    <Star
                      size={32}
                      className={cn(
                        "transition-colors",
                        i < rating
                          ? "text-warning-500 fill-warning-500"
                          : "text-gray-300 hover:text-warning-300"
                      )}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm text-gray-500">{rating} 星</span>
                )}
              </div>
            </div>

            <div className="mb-5">
              <div className="text-sm text-gray-600 mb-2">评价内容</div>
              <textarea
                value={evaluation}
                onChange={(e) => setEvaluation(e.target.value.slice(0, 200))}
                placeholder="请评价工作人员的服务态度、处理速度..."
                className="w-full h-28 p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all"
              />
              <div className="mt-1 text-right text-xs text-gray-400">
                {evaluation.length}/200
              </div>
            </div>

            <button
              onClick={handleSubmitEvaluation}
              disabled={submittingEval}
              className={cn(
                "w-full py-3.5 rounded-xl text-white text-sm font-medium shadow-md transition-all",
                submittingEval
                  ? "bg-primary-400 cursor-not-allowed"
                  : "gradient-primary shadow-primary-800/20 hover:opacity-95 active:scale-[0.98]"
              )}
            >
              {submittingEval ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  提交中...
                </div>
              ) : (
                "提交评价"
              )}
            </button>
          </div>
        </div>
      )}

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

      {previewCommImages !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setPreviewCommImages(null)}
        >
          <button
            onClick={() => setPreviewCommImages(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>
          {previewCommImages.index > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreviewCommImages((p) =>
                  p ? { ...p, index: (p.index - 1 + p.images.length) % p.images.length } : p
                );
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <img
            src={previewCommImages.images[previewCommImages.index]}
            alt={`图片${previewCommImages.index + 1}`}
            className="max-w-full max-h-[80vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {previewCommImages.index < previewCommImages.images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreviewCommImages((p) =>
                  p ? { ...p, index: (p.index + 1) % p.images.length } : p
                );
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          )}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 text-sm">
            {previewCommImages.index + 1} / {previewCommImages.images.length}
          </div>
        </div>
      )}

      {canCancelOrUrge && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 px-4 py-3 z-40">
          <div className="max-w-lg mx-auto grid grid-cols-3 gap-3">
            <div className="relative">
              <button
                onClick={() => setConfirmUrge(true)}
                className="w-full py-3 rounded-xl border-2 border-orange-200 text-orange-600 text-sm font-medium hover:bg-orange-50 active:bg-orange-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <Megaphone size={18} />
                催单
              </button>
              {urgeCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-orange-500 text-white text-[10px] rounded-full">
                  {urgeCount}
                </span>
              )}
              {urgeCount > 0 && (
                <p className="mt-1 text-[11px] text-center text-gray-400">
                  已催单 {urgeCount} 次
                </p>
              )}
            </div>
            {order.status === "processing" && (
              <button
                onClick={handleComplete}
                className="py-3 rounded-xl text-white text-sm font-medium bg-green-500 hover:bg-green-600 active:bg-green-700 shadow-md shadow-green-200 transition-all"
              >
                标记完成
              </button>
            )}
            <button
              onClick={handleCancel}
              className={cn(
                "py-3 rounded-xl text-white text-sm font-medium shadow-md transition-all",
                order.status === "processing"
                  ? "bg-danger-500 hover:bg-danger-600 active:bg-danger-700 shadow-danger-200"
                  : "bg-danger-500 hover:bg-danger-600 active:bg-danger-700 shadow-danger-200"
              )}
              style={
                order.status !== "processing"
                  ? { gridColumn: "2 / span 2" }
                  : undefined
              }
            >
              撤销报修
            </button>
          </div>
        </div>
      )}

      {confirmUrge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-slide-up">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Megaphone size={32} className="text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">确认催单</h3>
              <p className="text-sm text-gray-500 mb-6">
                确认催单？工作人员将优先处理您的报修
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfirmUrge(false)}
                className="py-3 rounded-xl border-2 border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleUrge}
                className="py-3 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 active:bg-orange-700 transition-colors"
              >
                确认催单
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
