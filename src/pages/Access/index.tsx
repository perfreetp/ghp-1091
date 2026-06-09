import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { QrCode, FileCheck, User, Plus, RefreshCw, Clock, MapPin } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<TabKey>("qrcode");
  const { qrToken, lastRefresh, refreshQr, tempRequests, records } = useAccessStore();
  const [countdown, setCountdown] = useState(60);

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

  const renderTempTab = () => (
    <div className="p-4 space-y-3">
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
          <div key={req.id} className="card card-hover p-4 animate-fade-in">
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
          </div>
        ))
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
