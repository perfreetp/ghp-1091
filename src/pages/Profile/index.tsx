import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Wrench,
  Package,
  Bell,
  Star,
  BookOpen,
  Info,
  MessageSquare,
  LogOut,
  ChevronRight,
  Building2,
  Briefcase,
  Layers,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useMessageStore } from "@/store/useMessageStore";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  badge?: number;
  onClick?: () => void;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const unreadCount = useMessageStore((s) => s.getUnreadCount());

  const menuGroups: MenuGroup[] = [
    {
      title: "我的服务",
      items: [
        {
          icon: CalendarDays,
          label: "我的预订",
          path: "/meeting/my",
        },
        {
          icon: Wrench,
          label: "我的报修",
          path: "/repair",
        },
        {
          icon: Package,
          label: "我的快递",
        },
        {
          icon: Bell,
          label: "消息中心",
          path: "/profile/messages",
          badge: unreadCount,
        },
      ],
    },
    {
      title: "服务评价",
      items: [
        {
          icon: Star,
          label: "满意度评价",
          path: "/profile/satisfaction",
        },
      ],
    },
    {
      title: "帮助中心",
      items: [
        {
          icon: BookOpen,
          label: "使用指南",
        },
        {
          icon: Info,
          label: "关于我们",
        },
        {
          icon: MessageSquare,
          label: "意见反馈",
        },
      ],
    },
  ];

  const handleItemClick = (item: MenuItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleLogout = () => {
    if (window.confirm("确定要退出登录吗？")) {
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="bg-gradient-to-br from-primary-800 via-primary-600 to-secondary-500 pt-12 pb-20 px-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/3" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm p-1">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-full bg-white object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent-500 rounded-full flex items-center justify-center border-2 border-white">
                <Briefcase size={14} className="text-white" />
              </div>
            </div>
            <div className="flex-1 text-white">
              <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
              <p className="text-white/80 text-sm flex items-center gap-1.5">
                <Layers size={14} />
                工号：{user.employeeId}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 bg-white/15 backdrop-blur-md rounded-2xl p-4">
            <div className="text-center text-white border-r border-white/20">
              <div className="flex items-center justify-center gap-1 text-white/70 text-xs mb-1">
                <Building2 size={12} />
                部门
              </div>
              <div className="text-sm font-semibold truncate px-1">
                {user.department}
              </div>
            </div>
            <div className="text-center text-white border-r border-white/20">
              <div className="flex items-center justify-center gap-1 text-white/70 text-xs mb-1">
                <Briefcase size={12} />
                公司
              </div>
              <div className="text-sm font-semibold truncate px-1">
                {user.company}
              </div>
            </div>
            <div className="text-center text-white">
              <div className="flex items-center justify-center gap-1 text-white/70 text-xs mb-1">
                <Layers size={12} />
                楼层
              </div>
              <div className="text-sm font-semibold">{user.floor}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-12 relative z-20 space-y-4">
        {menuGroups.map((group) => (
          <div
            key={group.title}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="px-5 pt-4 pb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {group.title}
              </span>
            </div>
            <div>
              {group.items.map((item, index) => {
                const Icon = item.icon;
                const isLast = index === group.items.length - 1;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center px-5 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors ${
                      !isLast ? "border-b border-gray-50" : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mr-4">
                      <Icon size={20} className="text-primary-800" />
                    </div>
                    <span className="flex-1 text-left text-gray-800 font-medium">
                      {item.label}
                    </span>
                    {item.badge && item.badge > 0 && (
                      <span className="mr-2 bg-accent-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                    <ChevronRight
                      size={18}
                      className="text-gray-300 flex-shrink-0"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-5 py-4 hover:bg-red-50 active:bg-red-100 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mr-4">
              <LogOut size={20} className="text-red-500" />
            </div>
            <span className="flex-1 text-left text-red-500 font-medium">
              退出登录
            </span>
            <ChevronRight size={18} className="text-red-300 flex-shrink-0" />
          </button>
        </div>

        <div className="text-center py-4">
          <p className="text-xs text-gray-400">版本 v1.0.0</p>
          <p className="text-xs text-gray-300 mt-1">
            © 2026 智慧楼宇服务平台
          </p>
        </div>
      </div>
    </div>
  );
}
