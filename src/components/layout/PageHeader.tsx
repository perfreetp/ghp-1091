import { useNavigate } from "react-router-dom";
import { ChevronLeft, Bell, Search } from "lucide-react";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  showSearch?: boolean;
  showBell?: boolean;
  rightContent?: React.ReactNode;
  onSearch?: () => void;
}

export default function PageHeader({
  title,
  showBack = false,
  showSearch = false,
  showBell = false,
  rightContent,
  onSearch,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center h-14 px-4">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
        )}
        <h1 className="flex-1 text-lg font-semibold text-gray-800 text-center">
          {title}
        </h1>
        <div className="flex items-center gap-1">
          {showSearch && (
            <button
              onClick={onSearch}
              className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <Search size={20} className="text-gray-600" />
            </button>
          )}
          {showBell && (
            <button className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
              <Bell size={20} className="text-gray-600" />
            </button>
          )}
          {rightContent}
          {!showSearch && !showBell && !rightContent && !showBack && (
            <div className="w-10" />
          )}
          {!showBack && (showSearch || showBell || rightContent) ? null : showBack ? null : (
            <div className="w-10" />
          )}
        </div>
      </div>
    </header>
  );
}
