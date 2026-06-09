import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import {
  Share2,
  Phone,
  Calendar,
  Car,
  FileText,
  User,
  AlertTriangle,
  ArrowLeft,
  UserCheck,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { useVisitorStore } from "@/store/useVisitorStore";
import { formatPhone } from "@/utils/format";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: "待来访", className: "bg-primary-500/10 text-primary-700" },
  arrived: { label: "已到访", className: "bg-success-500/10 text-success-600" },
  left: { label: "已离开", className: "bg-gray-500/10 text-gray-600" },
  cancelled: { label: "已取消", className: "bg-danger-500/10 text-danger-600" },
};

export default function VisitorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { visitors, cancelVisitor, verifyArrival, registerLeave } = useVisitorStore();
  const visitor = visitors.find((v) => v.id === id);

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleShare = () => {
    if (!visitor) return;
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

  const handleConfirmCancel = () => {
    if (!visitor) return;
    cancelVisitor(visitor.id);
    setConfirmCancel(false);
    navigate(-1);
  };

  const handleVerifyArrival = () => {
    if (!visitor) return;
    const result = verifyArrival(visitor.visitCode);
    if ("error" in result) {
      alert(result.error);
      return;
    }
    alert(`核验成功！访客 ${result.visitorName} 已到达`);
    setRefreshKey((k) => k + 1);
  };

  const handleRegisterLeave = () => {
    if (!visitor) return;
    if (!window.confirm("确认登记离访？")) return;
    registerLeave(visitor.id);
    setRefreshKey((k) => k + 1);
  };

  if (!visitor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="访客详情" showBack />
        <div className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <AlertTriangle size={40} className="text-gray-400" />
          </div>
          <p className="text-gray-500 mb-6">访客不存在或已删除</p>
          <button
            onClick={() => navigate("/visitor")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft size={18} />
            返回访客列表
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[visitor.status];
  const avatarSeed = encodeURIComponent(visitor.visitorName);
  const isPending = visitor.status === "pending";
  const isArrived = visitor.status === "arrived";

  return (
    <div className="min-h-screen bg-gray-50 pb-32" key={refreshKey}>
      <PageHeader
        title="访客详情"
        showBack
        showBell
        rightContent={
          isPending ? (
            <button
              onClick={handleShare}
              className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <Share2 size={20} className="text-gray-600" />
            </button>
          ) : undefined
        }
      />

      <div className="p-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center overflow-hidden shadow-md">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                alt={visitor.visitorName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <User size={44} className="text-primary-700 absolute" />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-800">
                {visitor.visitorName}
              </h2>
              <span className={cn("badge", statusConfig.className)}>
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 card p-6">
          <div className="flex flex-col items-center">
            <div className="relative p-5 bg-white rounded-2xl border-2 border-primary-100 shadow-sm">
              <QRCodeCanvas
                value={visitor.visitCode}
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
                {visitor.visitCode}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
              <Phone size={18} className="text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-0.5">手机号码</p>
              <p className="text-sm font-medium text-gray-800">
                {formatPhone(visitor.visitorPhone)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
              <Calendar size={18} className="text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-0.5">到访时间</p>
              <p className="text-sm font-medium text-gray-800">
                {visitor.visitTime}
                {visitor.leaveTime && (
                  <span className="text-gray-400 ml-1">~ {visitor.leaveTime}</span>
                )}
              </p>
            </div>
          </div>

          {visitor.arriveTime && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-success-50 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={18} className="text-success-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">实际到达时间</p>
                <p className="text-sm font-medium text-success-700">{visitor.arriveTime}</p>
              </div>
            </div>
          )}

          {visitor.actualLeaveTime && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <LogOut size={18} className="text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">实际离开时间</p>
                <p className="text-sm font-medium text-gray-700">{visitor.actualLeaveTime}</p>
              </div>
            </div>
          )}

          {visitor.plateNumber && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                <Car size={18} className="text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">车牌号码</p>
                <span className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium tracking-wider">
                  {visitor.plateNumber}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
              <FileText size={18} className="text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-0.5">来访事由</p>
              <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                {visitor.purpose}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isPending && (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 safe-bottom z-40">
          <div className="max-w-lg mx-auto grid grid-cols-3 gap-3">
            <button
              onClick={() => setConfirmCancel(true)}
              className="py-3 rounded-xl border-2 border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              取消预约
            </button>
            <button
              onClick={handleShare}
              className="py-3 rounded-xl bg-primary-50 text-primary-700 text-xs font-medium border-2 border-primary-100 hover:bg-primary-100 transition-colors flex items-center justify-center gap-1.5"
            >
              <Share2 size={16} />
              分享到访码
            </button>
            <button
              onClick={handleVerifyArrival}
              className="py-3 rounded-xl gradient-primary text-white text-xs font-medium shadow-md shadow-primary-800/20 flex items-center justify-center gap-1.5 hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <UserCheck size={16} />
              模拟前台核验
            </button>
          </div>
        </div>
      )}

      {isArrived && (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 safe-bottom z-40">
          <div className="max-w-lg mx-auto">
            <button
              onClick={handleRegisterLeave}
              className="w-full py-3.5 rounded-xl border-2 border-danger-500 text-danger-600 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-danger-50 active:bg-danger-100 transition-colors"
            >
              <LogOut size={18} />
              登记离访
            </button>
          </div>
        </div>
      )}

      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-slide-up">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-500/10 flex items-center justify-center">
                <AlertTriangle size={32} className="text-danger-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">确认取消预约</h3>
              <p className="text-sm text-gray-500 mb-6">
                取消后到访码将失效，访客将无法进入楼宇
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfirmCancel(false)}
                className="py-3 rounded-xl border-2 border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                再想想
              </button>
              <button
                onClick={handleConfirmCancel}
                className="py-3 rounded-xl bg-danger-500 text-white text-sm font-medium hover:bg-danger-600 active:bg-danger-700 transition-colors"
              >
                确认取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
