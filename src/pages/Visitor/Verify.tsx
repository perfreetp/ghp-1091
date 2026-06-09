import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  QrCode,
  User,
  Calendar,
  Car,
  FileText,
  LogOut,
  CheckCircle2,
  History,
  UserCheck,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { useVisitorStore } from "@/store/useVisitorStore";
import { formatPhone } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { VisitorReservation } from "@/types";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: "待来访", className: "bg-primary-500/10 text-primary-700" },
  arrived: { label: "已到访", className: "bg-success-500/10 text-success-600" },
  left: { label: "已离开", className: "bg-gray-500/10 text-gray-600" },
  cancelled: { label: "已取消", className: "bg-danger-500/10 text-danger-600" },
};

export default function VisitorVerify() {
  const navigate = useNavigate();
  const { visitors, verifyArrival, registerLeave } = useVisitorStore();
  const [visitCode, setVisitCode] = useState("");
  const [verifiedVisitor, setVerifiedVisitor] = useState<VisitorReservation | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleVerify = () => {
    setErrorMsg("");
    setSuccessMsg("");
    const code = visitCode.trim().toUpperCase();
    if (!code) {
      setErrorMsg("请输入到访码");
      return;
    }
    if (code.length !== 8) {
      setErrorMsg("到访码应为8位字符");
      return;
    }
    const result = verifyArrival(code);
    if ("error" in result) {
      setErrorMsg(result.error);
      return;
    }
    setVerifiedVisitor(result);
    setSuccessMsg(`核验成功！访客 ${result.visitorName} 已到达`);
    setRefreshKey((k) => k + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  const handleRegisterLeave = () => {
    if (!verifiedVisitor) return;
    if (!window.confirm("确认登记离访？")) return;
    registerLeave(verifiedVisitor.id);
    const updated = visitors.find((v) => v.id === verifiedVisitor.id);
    if (updated) {
      setVerifiedVisitor(updated);
    }
    setRefreshKey((k) => k + 1);
  };

  const today = new Date().toISOString().slice(0, 10);
  const todayVisitors = visitors.filter((v) => {
    const vDate = (v.arriveTime || v.createTime || v.visitTime || "").slice(0, 10);
    return vDate === today && (v.status === "arrived" || v.status === "left");
  });

  const visitorForCard = verifiedVisitor
    ? visitors.find((v) => v.id === verifiedVisitor.id) || verifiedVisitor
    : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-8" key={refreshKey}>
      <PageHeader title="前台核验" showBack showBell />

      <div className="px-5 pt-6 pb-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-700/20">
            <QrCode size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">访客核验</h2>
          <p className="text-sm text-gray-500 mt-1.5">输入或扫描访客到访码完成核验</p>
        </div>
      </div>

      <div className="px-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">到访码</label>
          <div className="relative">
            <input
              type="text"
              value={visitCode}
              onChange={(e) => {
                setVisitCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8));
                setErrorMsg("");
              }}
              onKeyDown={handleKeyDown}
              maxLength={8}
              placeholder="请输入8位到访码"
              className="w-full h-14 px-5 text-xl font-mono tracking-[0.3em] rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-center"
            />
          </div>

          {errorMsg && (
            <div className="mt-3 p-3 rounded-xl bg-danger-50 border border-danger-200 flex items-center gap-2 animate-fade-in">
              <span className="text-danger-600 text-sm font-medium">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mt-3 p-3 rounded-xl bg-success-50 border border-success-200 flex items-center gap-2 animate-fade-in">
              <CheckCircle2 size={18} className="text-success-600 flex-shrink-0" />
              <span className="text-success-700 text-sm font-medium">{successMsg}</span>
            </div>
          )}

          <button
            onClick={handleVerify}
            className="mt-4 w-full h-14 rounded-xl gradient-primary text-white font-semibold text-base shadow-md shadow-primary-800/20 flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all"
          >
            <UserCheck size={20} />
            核验到达
          </button>
        </div>

        {visitorForCard && (
          <div className="mt-5 bg-white rounded-2xl p-5 shadow-sm animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(visitorForCard.visitorName)}`}
                  alt={visitorForCard.visitorName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <User size={28} className="text-primary-700 absolute" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-800 truncate">{visitorForCard.visitorName}</h3>
                  <span
                    className={cn(
                      "badge flex-shrink-0",
                      STATUS_CONFIG[visitorForCard.status].className
                    )}
                  >
                    {STATUS_CONFIG[visitorForCard.status].label}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">被访人：{visitorForCard.hostName}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Calendar size={16} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">到访时间</p>
                  <p className="text-sm font-medium text-gray-800">
                    {visitorForCard.visitTime}
                    {visitorForCard.leaveTime && (
                      <span className="text-gray-400 ml-1">~ {visitorForCard.leaveTime}</span>
                    )}
                  </p>
                </div>
              </div>

              {visitorForCard.arriveTime && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-success-50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={16} className="text-success-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">实际到达时间</p>
                    <p className="text-sm font-medium text-success-700">{visitorForCard.arriveTime}</p>
                  </div>
                </div>
              )}

              {visitorForCard.actualLeaveTime && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <LogOut size={16} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">实际离开时间</p>
                    <p className="text-sm font-medium text-gray-700">{visitorForCard.actualLeaveTime}</p>
                  </div>
                </div>
              )}

              {visitorForCard.plateNumber && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Car size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">车牌号码</p>
                    <span className="inline-flex items-center px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium tracking-wider">
                      {visitorForCard.plateNumber}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">来访事由</p>
                  <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                    {visitorForCard.purpose}
                  </span>
                </div>
              </div>
            </div>

            {visitorForCard.status === "arrived" && (
              <button
                onClick={handleRegisterLeave}
                className="mt-5 w-full h-12 rounded-xl border-2 border-danger-500 text-danger-600 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-danger-50 active:bg-danger-100 transition-colors"
              >
                <LogOut size={18} />
                登记离访
              </button>
            )}

            {visitorForCard.status === "left" && (
              <div className="mt-5 w-full h-12 rounded-xl bg-gray-100 text-gray-400 font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                <CheckCircle2 size={18} />
                已离访
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3 px-1">
            <History size={16} className="text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">今日核验记录</h3>
          </div>

          {todayVisitors.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <p className="text-sm text-gray-400">暂无今日核验记录</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayVisitors.map((v) => (
                <div
                  key={v.id}
                  className="bg-white rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => navigate(`/visitor/${v.id}`)}
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <User size={20} className="text-primary-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800 truncate">{v.visitorName}</p>
                      <span
                        className={cn(
                          "badge flex-shrink-0",
                          STATUS_CONFIG[v.status].className
                        )}
                      >
                        {STATUS_CONFIG[v.status].label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {formatPhone(v.visitorPhone)} · {v.visitCode}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
