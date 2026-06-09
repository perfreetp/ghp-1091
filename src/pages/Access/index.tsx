import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { QrCode, FileCheck, User, Plus, RefreshCw, Clock, MapPin, Check, X, Ticket, AlertCircle } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { useAccessStore } from "@/store/useAccessStore";
import { getStatusText } from "@/utils/format";
import { cn } from "@/lib/utils";

type TabKey = "qrcode" | "temp" | "records";

const TABS: { key: TabKey; label: string }[] = [
  { key: "qrcode", label: "二维码门禁" },
  { key: "temp", label: "临时通行" },
  { key: "records", label: "通行记录" },
];

const ACCESS_AREAS = ["A座1号门", "A座2号门", "B座餐饮区入口", "停车场入口", "地下车库", "22F-25F 数据中心", "B1 档案库"];

export default function Access() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") as TabKey | null;
  const highlightId = searchParams.get("highlightId");
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab === "temp" ? "temp" : "qrcode");
  const { qrToken, lastRefresh, refreshQr, tempRequests, records, approveTempRequest, rejectTempRequest } = useAccessStore();
  const [countdown, setCountdown] = useState(60);
  const [refreshKey, setRefreshKey] = useState(0);
  const [rejectModal, setRejectModal] = useState<{ id: string; open: boolean }>({ id: "", open: false });
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    setCountdown(60);
  }, [lastRefresh]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          refreshQr();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [refreshQr]);

  useEffect(() => {
    if (highlightId && activeTab === "temp") {
      const timer = setTimeout(() => {
        document.getElementById(highlightId)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [highlightId, activeTab, tempRequests]);

  const renderQrCodeTab = () => (
    <div className="flex flex-col items-center px-6 pt-8 pb-6">
      <div className="relative p-6 bg-white rounded-3xl animate-breath border-2 border-primary-100">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-500/5 to-secondary-500/5" />
        <QRCodeCanvas
          value={qrToken}
          size={220}
          level="H"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#1e3a8a"
        />
      </div>

      <div className="mt-6 flex items-center gap-2 text-gray-500 text-sm">
        <RefreshCw size={16} className={cn("text-primary-600", countdown > 0 && "animate-spin")} style={{ animationDuration: "3s" }} />
        <span>
          <span className="text-primary-700 font-semibold">{countdown}</span> 秒后自动刷新
        </span>
      </div>

      <p className="mt-4 text-gray-500 text-sm text-center max-w-xs leading-relaxed">
        将二维码对准门禁扫码区域，<br />即可快速通行
      </p>

      <button
        onClick={() => navigate("/access/temp")}
        className="mt-8 w-full max-w-xs btn-primary flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        申请临时通行
      </button>
    </div>
  );

  const handleApprove = (id: string) => {
    if (!window.confirm("确认通过此临时通行申请？")) return;
    approveTempRequest(id);
    setRefreshKey((k) => k + 1);
  };

  const handleRejectClick = (id: string) => {
    setRejectModal({ id, open: true });
    setRejectReason("");
  };

  const handleConfirmReject = () => {
    const reason = rejectReason.trim();
    if (!reason) {
      alert("请填写拒绝原因");
      return;
    }
    rejectTempRequest(rejectModal.id, reason);
    setRejectModal({ id: "", open: false });
    setRejectReason("");
    setRefreshKey((k) => k + 1);
  };

  const renderTempTab = () => (
    <div className="p-4 space-y-3" key={refreshKey}>
      <div className="mb-2 px-2 py-2 rounded-xl bg-primary-50 border border-primary-100">
        <p className="text-xs text-primary-700 flex items-center gap-1.5">
          <AlertCircle size={14} />
          您是管理员/前台？在此模拟审批流程（演示功能）
        </p>
      </div>

      <button
        onClick={() => navigate("/access/temp")}
        className="w-full card card-hover p-4 flex items-center justify-between border-2 border-dashed border-primary-200 bg-primary-50/50"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <Plus size={20} className="text-primary-700" />
          </div>
          <div>
            <p className="font-medium text-gray-800">申请临时通行</p>
            <p className="text-xs text-gray-500">需要访问受限区域时使用</p>
          </div>
        </div>
      </button>

      {tempRequests.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <Clock size={40} className="mx-auto mb-3 opacity-50" />
          <p>暂无临时通行申请</p>
        </div>
      ) : (
        tempRequests.map((req) => (
          <div
            key={req.id}
            id={req.id}
            className={cn(
              "card card-hover p-4 animate-fade-in",
              req.id === highlightId && "ring-2 ring-primary-400 bg-primary-50 animate-pulse"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-800">{req.area}</p>
                <p className="text-xs text-gray-500 mt-1">申请时间：{req.createTime}</p>
              </div>
              <span
                className={cn(
                  "badge",
                  req.status === "approved" && "bg-success-500/10 text-success-600",
                  req.status === "pending" && "bg-primary-500/10 text-primary-700",
                  req.status === "rejected" && "bg-danger-500/10 text-danger-600"
                )}
              >
                {getStatusText(req.status)}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-gray-400" />
                <span>{req.startTime} ~ {req.endTime}</span>
              </div>
              {req.reason && (
                <div className="flex items-start gap-2">
                  <FileCheck size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-500">{req.reason}</span>
                </div>
              )}
            </div>

            {req.status === "approved" && req.accessToken && (
              <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-success-50 to-accent-50 border border-success-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <Ticket size={14} className="text-success-600" />
                  <span className="text-xs font-semibold text-success-700">通行凭证</span>
                </div>
                <p className="text-2xl font-bold tracking-[0.25em] text-success-700 font-mono">
                  {req.accessToken}
                </p>
                {req.approvedTime && (
                  <p className="text-xs text-gray-400 mt-1.5">审批时间：{req.approvedTime}</p>
                )}
              </div>
            )}

            {req.status === "rejected" && req.rejectReason && (
              <div className="mt-4 p-3 rounded-xl bg-danger-50 border border-danger-200">
                <div className="flex items-start gap-2">
                  <AlertCircle size={14} className="text-danger-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-danger-700">拒绝原因</span>
                    <p className="text-sm text-danger-600 mt-1">{req.rejectReason}</p>
                  </div>
                </div>
              </div>
            )}

            {req.status === "pending" && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleApprove(req.id)}
                  className="py-2.5 rounded-xl bg-success-500 text-white text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-success-600 active:bg-success-700 transition-colors"
                >
                  <Check size={16} />
                  通过
                </button>
                <button
                  onClick={() => handleRejectClick(req.id)}
                  className="py-2.5 rounded-xl border-2 border-danger-500 text-danger-600 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-danger-50 active:bg-danger-100 transition-colors"
                >
                  <X size={16} />
                  拒绝
                </button>
              </div>
            )}
          </div>
        ))
      )}

      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-slide-up">
            <div className="text-center mb-4">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-danger-500/10 flex items-center justify-center">
                <AlertCircle size={28} className="text-danger-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">拒绝临时通行</h3>
              <p className="text-sm text-gray-500 mt-1.5">请填写拒绝原因，申请人将收到通知</p>
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="请输入拒绝原因..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-danger-400 focus:ring-4 focus:ring-danger-500/10 outline-none transition-all text-sm resize-none"
            />
            <div className="grid grid-cols-2 gap-3 mt-5">
              <button
                onClick={() => setRejectModal({ id: "", open: false })}
                className="py-3 rounded-xl border-2 border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmReject}
                className="py-3 rounded-xl bg-danger-500 text-white text-sm font-medium hover:bg-danger-600 active:bg-danger-700 transition-colors"
              >
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderRecordsTab = () => (
    <div className="p-4 space-y-3">
      {records.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <MapPin size={40} className="mx-auto mb-3 opacity-50" />
          <p>暂无通行记录</p>
        </div>
      ) : (
        records.map((record) => (
          <div key={record.id} className="card p-4 flex items-center gap-4 animate-fade-in">
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0",
                record.type === "qrcode" && "bg-primary-100 text-primary-700",
                record.type === "temporary" && "bg-accent-100 text-accent-700",
                record.type === "face" && "bg-secondary-100 text-secondary-700"
              )}
            >
              {record.type === "qrcode" && <QrCode size={22} />}
              {record.type === "temporary" && <FileCheck size={22} />}
              {record.type === "face" && <User size={22} />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-gray-800 truncate">{record.location}</p>
                <span
                  className={cn(
                    "badge flex-shrink-0",
                    record.status === "success" && "bg-success-500/10 text-success-600",
                    record.status === "failed" && "bg-danger-500/10 text-danger-600"
                  )}
                >
                  {record.status === "success" ? "成功" : "失败"}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">{record.time}</p>
                <p className="text-xs text-gray-400">
                  {record.type === "qrcode" && "二维码"}
                  {record.type === "temporary" && "临时通行"}
                  {record.type === "face" && "人脸识别"}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="app-container pb-safe-bottom">
      <PageHeader title="通行" showBell />

      <div className="sticky top-14 z-30 bg-white border-b border-gray-100">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors",
                activeTab === tab.key ? "tab-active" : "tab-inactive"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-fade-in">
        {activeTab === "qrcode" && renderQrCodeTab()}
        {activeTab === "temp" && renderTempTab()}
        {activeTab === "records" && renderRecordsTab()}
      </div>
    </div>
  );
}
