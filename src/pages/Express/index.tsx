import { useState } from "react";
import { Package, MapPin, Clock, ChevronRight, CheckCircle } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { useMessageStore } from "@/store/useMessageStore";
import type { ExpressDelivery } from "@/types";
import { cn } from "@/lib/utils";

const companyLogos: Record<string, { bg: string; text: string; abbr: string }> = {
  "顺丰速运": { bg: "bg-black", text: "text-white", abbr: "SF" },
  "京东物流": { bg: "bg-red-500", text: "text-white", abbr: "JD" },
  "中通快递": { bg: "bg-blue-500", text: "text-white", abbr: "ZT" },
  "圆通速递": { bg: "bg-purple-500", text: "text-white", abbr: "YT" },
  "韵达快递": { bg: "bg-yellow-500", text: "text-white", abbr: "YD" },
  "申通快递": { bg: "bg-orange-500", text: "text-white", abbr: "ST" },
  "百世快递": { bg: "bg-cyan-500", text: "text-white", abbr: "BS" },
  "邮政EMS": { bg: "bg-green-600", text: "text-white", abbr: "EMS" },
};

const getCompanyLogo = (company: string) => {
  return companyLogos[company] || { bg: "bg-gray-500", text: "text-white", abbr: company.slice(0, 2) };
};

const getRemainingHours = (arriveTime: string) => {
  const now = new Date();
  const arrive = new Date(arriveTime.replace(/-/g, "/"));
  const diffMs = now.getTime() - arrive.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const remainHours = Math.max(0, 48 - diffHours);
  return remainHours;
};

type TabType = "pending" | "picked";

export default function Express() {
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const { deliveries, pickUpDelivery } = useMessageStore();

  const pendingDeliveries = deliveries.filter((d) => d.status === "pending");
  const pickedDeliveries = deliveries.filter((d) => d.status === "picked");

  const tabs = [
    { key: "pending" as const, label: "待取件", count: pendingDeliveries.length },
    { key: "picked" as const, label: "已取件", count: pickedDeliveries.length },
  ];

  const currentList = activeTab === "pending" ? pendingDeliveries : pickedDeliveries;

  const handlePickUp = (id: string) => {
    if (window.confirm("确认已取件？")) {
      pickUpDelivery(id);
    }
  };

  const renderPendingCard = (item: ExpressDelivery) => {
    const logo = getCompanyLogo(item.company);
    const remainHours = getRemainingHours(item.arriveTime);

    return (
      <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-3">
        <div className="flex items-start gap-3 mb-4">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", logo.bg)}>
            <span className={cn("text-sm font-bold", logo.text)}>{logo.abbr}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-800">{item.company}</h3>
              <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">待取件</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={12} />
              <span className="truncate">{item.lockerLocation}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-4 text-center">
          <p className="text-xs text-gray-500 mb-1">取件码</p>
          <p className="text-3xl font-bold text-primary-700 tracking-widest">{item.pickupCode}</p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock size={12} className="text-amber-500" />
            <span>预计保留剩余 <span className="font-semibold text-amber-600">{remainHours}</span> 小时</span>
          </div>
          <span className="text-[10px] text-gray-400">到达 {item.arriveTime}</span>
        </div>

        <button
          onClick={() => handlePickUp(item.id)}
          className="w-full py-3.5 rounded-xl bg-success-500 text-white font-semibold flex items-center justify-center gap-2 active:bg-success-600 transition-colors shadow-sm"
        >
          <CheckCircle size={18} />
          我已取件
        </button>
      </div>
    );
  };

  const renderPickedCard = (item: ExpressDelivery) => {
    const logo = getCompanyLogo(item.company);

    return (
      <div key={item.id} className="bg-gray-50 rounded-2xl border border-gray-100 p-4 mb-3 opacity-80">
        <div className="flex items-start gap-3 mb-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 opacity-60", logo.bg)}>
            <span className={cn("text-xs font-bold", logo.text)}>{logo.abbr}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-500 text-sm">{item.company}</h3>
              <span className="text-[10px] px-2 py-0.5 bg-gray-200 text-gray-500 rounded-full">已取件</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin size={12} />
              <span className="truncate">{item.lockerLocation}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-gray-100 border-b border-gray-100 mb-3">
          <div>
            <p className="text-[10px] text-gray-400 mb-0.5">取件码</p>
            <p className="text-lg font-semibold text-gray-400 tracking-wider">{item.pickupCode}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 mb-0.5">取件时间</p>
            <p className="text-xs text-gray-500">{item.pickedTime || "-"}</p>
          </div>
        </div>

        <button className="w-full py-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 text-sm font-medium flex items-center justify-center gap-1 active:bg-gray-100 transition-colors">
          查看详情
          <ChevronRight size={14} />
        </button>
      </div>
    );
  };

  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Package size={40} className="text-gray-300" />
      </div>
      <p className="text-gray-400 text-sm">{activeTab === "pending" ? "暂无待取快递" : "暂无已取快递记录"}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <PageHeader title="我的快递" showBack />

      <div className="sticky top-14 z-30 bg-gray-50 px-4 py-3">
        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5",
                activeTab === tab.key
                  ? "bg-primary-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-full",
                activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        {currentList.length === 0
          ? renderEmpty()
          : currentList.map((item) =>
              activeTab === "pending" ? renderPendingCard(item) : renderPickedCard(item)
            )}
      </div>
    </div>
  );
}
