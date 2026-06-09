import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { User, Phone, Calendar, Car, FileText, Copy, Share2, Check, ArrowLeft } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { useVisitorStore } from "@/store/useVisitorStore";
import { cn } from "@/lib/utils";
import type { VisitorReservation } from "@/types";

const PURPOSE_OPTIONS = [
  { value: "商务洽谈", label: "商务洽谈" },
  { value: "面试", label: "面试" },
  { value: "快递", label: "快递" },
  { value: "其他", label: "其他" },
];

function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getDefaultVisitTime(): string {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);
  if (now.getHours() >= 18) {
    now.setDate(now.getDate() + 1);
    now.setHours(10, 0, 0, 0);
  }
  return formatDateTimeLocal(now);
}

export default function Reserve() {
  const navigate = useNavigate();
  const { addVisitor } = useVisitorStore();

  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [visitTime, setVisitTime] = useState(getDefaultVisitTime());
  const [plateNumber, setPlateNumber] = useState("");
  const [purpose, setPurpose] = useState(PURPOSE_OPTIONS[0].value);
  const [submitting, setSubmitting] = useState(false);
  const [newVisitor, setNewVisitor] = useState<VisitorReservation | null>(null);
  const [copied, setCopied] = useState(false);

  const validatePhone = (phone: string): boolean => {
    return /^1[3-9]\d{9}$/.test(phone);
  };

  const handleSubmit = () => {
    if (!visitorName.trim()) {
      alert("请输入访客姓名");
      return;
    }
    if (!validatePhone(visitorPhone)) {
      alert("请输入正确的手机号码");
      return;
    }
    if (!visitTime) {
      alert("请选择来访时间");
      return;
    }
    if (!purpose) {
      alert("请选择来访事由");
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      const visitor = addVisitor({
        visitorName: visitorName.trim(),
        visitorPhone: visitorPhone.trim(),
        visitTime: visitTime.replace("T", " "),
        purpose,
        plateNumber: plateNumber.trim() || undefined,
      });

      setSubmitting(false);
      setNewVisitor(visitor);
    }, 600);
  };

  const handleCopyCode = () => {
    if (!newVisitor) return;
    navigator.clipboard.writeText(newVisitor.visitCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      alert(newVisitor.visitCode);
    });
  };

  const handleShare = () => {
    if (!newVisitor) return;
    const text = `【智慧楼宇访客邀请】\n访客姓名：${newVisitor.visitorName}\n来访时间：${newVisitor.visitTime}\n到访码：${newVisitor.visitCode}\n请凭到访码进入楼宇`;
    if (navigator.share) {
      navigator.share({ title: "访客到访码", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        alert("到访码信息已复制到剪贴板");
      }).catch(() => {
        alert(`到访码：${newVisitor.visitCode}`);
      });
    }
  };

  if (newVisitor) {
    return (
      <div className="app-container min-h-screen flex flex-col">
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center h-14 px-4">
            <button
              onClick={() => navigate("/visitor")}
              className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-700" />
            </button>
            <h1 className="flex-1 text-lg font-semibold text-gray-800 text-center">
              预约成功
            </h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-success-500/10 flex items-center justify-center mb-4">
              <Check size={40} className="text-success-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">访客预约成功</h2>
            <p className="text-sm text-gray-500">请将到访码告知访客</p>
          </div>

          <div className="mt-8 card p-6 animate-slide-up">
            <div className="flex flex-col items-center">
              <div className="relative p-5 bg-white rounded-2xl border-2 border-primary-100 shadow-sm">
                <QRCodeCanvas
                  value={newVisitor.visitCode}
                  size={180}
                  level="H"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#1e3a8a"
                />
              </div>

              <div className="mt-5 text-center">
                <p className="text-xs text-gray-500 mb-1.5">到访码</p>
                <p className="text-3xl font-bold tracking-[0.3em] text-primary-800 font-mono">
                  {newVisitor.visitCode}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">访客姓名</span>
                <span className="font-medium text-gray-800">{newVisitor.visitorName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">联系电话</span>
                <span className="font-medium text-gray-800">{newVisitor.visitorPhone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">来访时间</span>
                <span className="font-medium text-gray-800">{newVisitor.visitTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">来访事由</span>
                <span className="font-medium text-gray-800">{newVisitor.purpose}</span>
              </div>
              {newVisitor.plateNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">车牌号码</span>
                  <span className="font-medium text-gray-800">{newVisitor.plateNumber}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-500">被访人</span>
                <span className="font-medium text-gray-800">{newVisitor.hostName}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={handleCopyCode}
              className="btn-secondary flex items-center justify-center gap-2 py-3.5"
            >
              {copied ? (
                <>
                  <Check size={18} className="text-success-500" />
                  已复制
                </>
              ) : (
                <>
                  <Copy size={18} />
                  复制到访码
                </>
              )}
            </button>
            <button
              onClick={handleShare}
              className="btn-primary flex items-center justify-center gap-2 py-3.5"
            >
              <Share2 size={18} />
              分享邀请
            </button>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 safe-bottom">
          <button
            onClick={() => navigate("/visitor")}
            className="w-full btn-secondary"
          >
            返回访客列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container pb-safe-bottom flex flex-col min-h-screen">
      <PageHeader title="预约访客" showBack />

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div className="card p-4 space-y-4">
          <div>
            <label className="label-text flex items-center gap-2">
              <User size={16} className="text-primary-600" />
              访客姓名
              <span className="text-danger-500 font-normal">*</span>
            </label>
            <input
              type="text"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              placeholder="请输入访客姓名"
              maxLength={20}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-text flex items-center gap-2">
              <Phone size={16} className="text-primary-600" />
              手机号码
              <span className="text-danger-500 font-normal">*</span>
            </label>
            <input
              type="tel"
              value={visitorPhone}
              onChange={(e) => setVisitorPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
              placeholder="请输入11位手机号码"
              inputMode="numeric"
              className="input-field"
            />
          </div>

          <div>
            <label className="label-text flex items-center gap-2">
              <Calendar size={16} className="text-primary-600" />
              来访时间
              <span className="text-danger-500 font-normal">*</span>
            </label>
            <input
              type="datetime-local"
              value={visitTime}
              onChange={(e) => setVisitTime(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-text flex items-center gap-2">
              <Car size={16} className="text-primary-600" />
              车牌号码
              <span className="text-xs text-gray-400 font-normal">（选填）</span>
            </label>
            <input
              type="text"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
              placeholder="例如：京A12345"
              maxLength={10}
              className="input-field"
            />
          </div>
        </div>

        <div className="card p-4">
          <label className="label-text flex items-center gap-2 mb-3">
            <FileText size={16} className="text-primary-600" />
            来访事由
            <span className="text-danger-500 font-normal">*</span>
          </label>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="input-field appearance-none bg-gray-50 cursor-pointer"
          >
            {PURPOSE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="card p-4 bg-secondary-50/50 border-secondary-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary-100 flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-secondary-700" />
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-800">温馨提示</p>
              <p className="text-xs leading-relaxed">
                1. 请准确填写访客信息，便于前台快速登记<br />
                2. 到访码为访客进入楼宇的唯一凭证<br />
                3. 访客离开时请前往前台办理离访手续
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
            "确认预约"
          )}
        </button>
      </div>
    </div>
  );
}
