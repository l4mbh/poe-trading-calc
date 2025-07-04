import React from "react";
import { NavLink } from "react-router-dom";
import { Coins } from "lucide-react";

interface HeaderProps {
  searchTerm?: string;
  onSearchChange?: (v: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <header className="bg-slate-900/80 border-b border-slate-800 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[4.5rem]">
        <div className="flex items-center gap-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
              <Coins className="w-6 h-6 text-slate-900" />
            </div>
            <span className="text-2xl font-bold text-white">
              POE Trading Calculator
            </span>
          </div>
          <nav className="flex items-center gap-6 ml-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `transition-colors ${
                  isActive
                    ? "text-yellow-400"
                    : "text-slate-200 hover:text-yellow-400"
                }`
              }
              end
            >
              Trang chủ
            </NavLink>
            <NavLink
              to="/shares"
              className={({ isActive }) =>
                `transition-colors ${
                  isActive
                    ? "text-yellow-400"
                    : "text-slate-300 hover:text-yellow-400"
                }`
              }
            >
              Chia sẻ
            </NavLink>
            <NavLink
              to="/updates"
              className={({ isActive }) =>
                `transition-colors ${
                  isActive
                    ? "text-yellow-400"
                    : "text-slate-300 hover:text-yellow-400"
                }`
              }
            >
              Cập nhật
            </NavLink>
            <NavLink
              to="/statistics"
              className={({ isActive }) =>
                `transition-colors ${
                  isActive
                    ? "text-yellow-400"
                    : "text-slate-300 hover:text-yellow-400"
                }`
              }
            >
              Thống kê
            </NavLink>
          </nav>
        </div>
        {onSearchChange && (
          <input
            type="text"
            placeholder="Tìm kiếm giao dịch..."
            value={searchTerm}
            hidden={!onSearchChange}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`bg-slate-800 text-white rounded px-3 py-1 border border-slate-700 focus:border-yellow-400 focus:outline-none w-64 ${
              searchTerm ? "w-96" : "w-64"
            }`}
          />
        )}
      </div>
    </header>
  );
};

export { Header };
