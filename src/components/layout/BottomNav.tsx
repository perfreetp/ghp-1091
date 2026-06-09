import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  QrCode,
  Users,
  CalendarDays,
  User,
} from "lucide-react";
import { useMessageStore } from "@/store/useMessageStore";

const navItems = [
  { to: "/home", icon: Home, label: "首页" },
  { to: "/access", icon: QrCode, label: "通行" },
  { to: "/visitor", icon: Users, label: "访客" },
  { to: "/meeting", icon: CalendarDays, label: "会议" },
  { to: "/profile", icon: User, label: "我的" },
];

const shortcutRoutes = ["/repair", "/parking"];

export default function BottomNav() {
  const location = useLocation();
  const unreadCount = useMessageStore((s) => s.getUnreadCount());

  const isActive = (to: string) => {
    if (to === "/home") {
      return location.pathname === "/home" || location.pathname === "/";
    }
    if (shortcutRoutes.some((r) => location.pathname.startsWith(r))) {
      return false;
    }
    return location.pathname.startsWith(to);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="app-container">
        <div
          className="flex items-center justify-around px-2"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center py-2.5 px-3 min-w-[64px] transition-all duration-200 relative ${
                  active ? "text-primary-800" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <div className="relative">
                  <Icon
                    size={24}
                    strokeWidth={active ? 2.5 : 2}
                    className={`transition-all duration-200 ${
                      active ? "scale-110" : ""
                    }`}
                  />
                  {item.to === "/profile" && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-accent-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[11px] mt-1 font-medium transition-all duration-200 ${
                    active ? "font-semibold" : ""
                  }`}
                >
                  {item.label}
                </span>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-800 rounded-full" />
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
