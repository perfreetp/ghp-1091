import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  FileCheck,
  CalendarDays,
  Wrench,
  Settings,
  CheckCheck,
  Clock,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { useMessageStore } from "@/store/useMessageStore";
import type { SystemMessage } from "@/types";

type MessageTab = "all" | "notice" | "approval" | "booking" | "repair";

const tabs: { key: MessageTab; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "notice", label: "通知" },
  { key: "approval", label: "审批" },
  { key: "booking", label: "预订" },
  { key: "repair", label: "报修" },
];

const typeIconMap: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  notice: { icon: Bell, color: "text-primary-800", bg: "bg-primary-100" },
  approval: { icon: FileCheck, color: "text-success-600", bg: "bg-success-500/10" },
  booking: { icon: CalendarDays, color: "text-secondary-600", bg: "bg-secondary-100" },
  repair: { icon: Wrench, color: "text-accent-600", bg: "bg-accent-100" },
  system: { icon: Settings, color: "text-gray-600", bg: "bg-gray-100" },
};

const typeNameMap: Record<string, string> = {
  notice: "通知",
  approval: "审批",
  booking: "预订",
  repair: "报修",
  system: "系统",
};

export default function Messages() {
  const navigate = useNavigate();
  const { messages, markAsRead, markAllAsRead } = useMessageStore();

  const [activeTab, setActiveTab] = useState<MessageTab>("all");

  const filteredMessages = useMemo(() => {
    if (activeTab === "all") return messages;
    return messages.filter((m) => m.type === activeTab);
  }, [messages, activeTab]);

  const unreadCount = messages.filter((m) => !m.isRead).length;
  const filteredUnreadCount = filteredMessages.filter((m) => !m.isRead).length;

  const getTypeIcon = (type: string) => {
    const config = typeIconMap[type] || typeIconMap.system;
    const Icon = config.icon;
    return { Icon, ...config };
  };

  const getNavigatePath = (msg: SystemMessage): string => {
    switch (msg.type) {
      case "approval":
        return "/access";
      case "notice":
        if (msg.content.includes("访客")) {
          return "/visitor";
        }
        return "/home";
      case "booking":
        return "/meeting/my";
      case "repair":
        if (msg.relatedId) {
          return `/repair/${msg.relatedId}`;
        }
        return "/repair/list";
      case "system":
      default:
        return "/home";
    }
  };

  const handleMessageClick = (msg: SystemMessage) => {
    if (!msg.isRead) {
      markAsRead(msg.id);
    }
    const path = getNavigatePath(msg);
    setTimeout(() => {
      navigate(path);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader
        showBack
        title="消息中心"
        rightContent={
          unreadCount > 0 ? (
            <button
              onClick={markAllAsRead}
              className="text-sm text-primary-800 font-medium flex items-center gap-1 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <CheckCheck size={16} />
              全部已读
            </button>
          ) : null
        }
      />

      <div className="sticky top-14 z-30 bg-gray-50 pt-2">
        <div className="px-4">
          <div className="bg-white rounded-2xl p-1.5 flex gap-1 shadow-sm">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const tabUnread =
                tab.key === "all"
                  ? unreadCount
                  : messages.filter((m) => m.type === tab.key && !m.isRead).length;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all relative ${
                    isActive
                      ? "bg-primary-800 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                  {tabUnread > 0 && (
                    <span
                      className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 ${
                        isActive
                          ? "bg-accent-500 text-white"
                          : "bg-accent-500 text-white"
                      }`}
                    >
                      {tabUnread > 99 ? "99+" : tabUnread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Bell size={36} className="text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm">暂无消息</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUnreadCount > 0 && (
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-xs text-gray-400">
                  {filteredUnreadCount} 条未读消息
                </span>
              </div>
            )}
            {filteredMessages.map((msg) => {
              const { Icon, color, bg } = getTypeIcon(msg.type);
              return (
                <button
                  key={msg.id}
                  onClick={() => handleMessageClick(msg)}
                  className={`w-full bg-white rounded-2xl p-4 shadow-sm transition-all hover:shadow-md active:scale-[0.99] text-left relative ${
                    !msg.isRead ? "ring-1 ring-primary-100" : ""
                  }`}
                >
                  {!msg.isRead && (
                    <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-accent-500 animate-pulse" />
                  )}
                  <div className="flex gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}
                    >
                      <Icon size={22} className={color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${bg} ${color} font-medium`}
                        >
                          {typeNameMap[msg.type] || "系统"}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={10} />
                          {msg.createTime}
                        </span>
                      </div>
                      <h3
                        className={`font-semibold mb-1 truncate ${
                          !msg.isRead ? "text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {msg.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
