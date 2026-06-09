import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, MapPin, FileText, Check } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { useAccessStore } from "@/store/useAccessStore";
import { useUserStore } from "@/store/useUserStore";
import { useMessageStore } from "@/store/useMessageStore";
import { cn } from "@/lib/utils";

const AREA_OPTIONS = [
  "A座1号门",
  "A座2号门",
  "B座餐饮区入口",
  "停车场入口",
  "地下车库",
  "15F-20F 办公区",
  "22F-25F 数据中心",
  "B1 档案库",
  "楼顶天台",
  "机房区域",
];

function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function TempAccess() {
  const navigate = useNavigate();
  const { addTempRequest } = useAccessStore();
  const { user } = useUserStore();
  const addMessage = useMessageStore((s) => s.addMessage);
  const [startTime, setStartTime] = useState(formatDateTimeLocal(new Date()));
  const [endTime, setEndTime] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleSubmit = () => {
    if (!startTime || !endTime) {
      alert("请选择开始和结束时间");
      return;
    }
    if (selectedAreas.length === 0) {
      alert("请至少选择一个通行区域");
      return;
    }
    if (!reason.trim()) {
      alert("请填写申请理由");
      return;
    }

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    if (end <= start) {
      alert("结束时间必须晚于开始时间");
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      const newReq = addTempRequest({
        applicant: user?.name || "当前用户",
        startTime: startTime.replace("T", " "),
        endTime: endTime.replace("T", " "),
        area: selectedAreas.join("、"),
        reason: reason.trim(),
      });

      addMessage({
        type: "approval",
        title: "临时通行申请已提交",
        content: `您申请的区域临时通行申请已提交，请等待审批。通行区域：${selectedAreas.join("、")}，时间：${startTime.replace("T", " ")}~${endTime.replace("T", " ")}`,
        relatedId: newReq.id,
      });

      setSubmitting(false);
      setSuccess(true);

      setTimeout(() => {
        navigate(-1);
      }, 1500);
    }, 500);
  };

  if (success) {
    return (
      <div className="app-container flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-20 h-20 rounded-full bg-success-500/10 flex items-center justify-center mb-6 animate-fade-in">
          <Check size={40} className="text-success-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">申请提交成功</h2>
        <p className="text-gray-500 text-sm">请等待管理员审批，审批结果将通过消息通知您</p>
      </div>
    );
  }

  return (
    <div className="app-container pb-safe-bottom flex flex-col min-h-screen">
      <PageHeader title="申请临时通行" showBack />

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div className="card p-4 space-y-4">
          <div>
            <label className="label-text flex items-center gap-2">
              <Clock size={16} className="text-primary-600" />
              开始时间
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-text flex items-center gap-2">
              <Clock size={16} className="text-primary-600" />
              结束时间
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="input-field"
              min={startTime}
              placeholder="请选择结束时间"
            />
          </div>
        </div>

        <div className="card p-4">
          <label className="label-text flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-primary-600" />
            通行区域
            <span className="text-xs text-gray-400 font-normal">（可多选）</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {AREA_OPTIONS.map((area) => {
              const isSelected = selectedAreas.includes(area);
              return (
                <button
                  key={area}
                  onClick={() => toggleArea(area)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm border transition-all duration-200",
                    isSelected
                      ? "bg-primary-700 text-white border-primary-700 shadow-md shadow-primary-700/20"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-700"
                  )}
                >
                  {isSelected && <Check size={14} className="inline -mt-0.5 mr-1" />}
                  {area}
                </button>
              );
            })}
          </div>
        </div>

        <div className="card p-4">
          <label className="label-text flex items-center gap-2 mb-3">
            <FileText size={16} className="text-primary-600" />
            申请理由
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            maxLength={200}
            placeholder="请详细说明申请临时通行的原因..."
            className="input-field resize-none"
          />
          <div className="flex justify-end mt-2">
            <span className="text-xs text-gray-400">{reason.length}/200</span>
          </div>
        </div>

        <div className="card p-4 bg-primary-50/50 border-primary-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-primary-700" />
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-800">温馨提示</p>
              <p className="text-xs leading-relaxed">
                1. 临时通行申请需经管理员审批后方可生效<br />
                2. 请如实填写申请理由，虚假申请将被拒绝<br />
                3. 通行权限仅限申请时间和区域内有效
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 safe-bottom">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={cn(
            "w-full btn-primary flex items-center justify-center gap-2",
            submitting && "opacity-70 cursor-not-allowed"
          )}
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              提交中...
            </>
          ) : (
            "提交申请"
          )}
        </button>
      </div>
    </div>
  );
}
