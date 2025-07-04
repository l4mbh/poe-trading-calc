import React from 'react';
import { NavLink } from 'react-router-dom';
import { Github, MessageCircle, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900/80 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* App Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">POE Trading Calculator</h3>
            <p className="text-slate-400 text-sm mb-4">
              Công cụ tính toán lợi nhuận giao dịch Path of Exile với hỗ trợ đa tiền tệ và thống kê chi tiết.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/your-username/poe-trading-calc"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
                <span className="text-sm">GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://discord.gg/your-discord"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">Discord</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Liên kết nhanh</h3>
            <nav className="space-y-2">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `block text-sm transition-colors ${
                    isActive
                      ? "text-yellow-400"
                      : "text-slate-400 hover:text-white"
                  }`
                }
              >
                Trang chủ
              </NavLink>
              <NavLink
                to="/statistics"
                className={({ isActive }) =>
                  `block text-sm transition-colors ${
                    isActive
                      ? "text-yellow-400"
                      : "text-slate-400 hover:text-white"
                  }`
                }
              >
                Thống kê
              </NavLink>
              <NavLink
                to="/shares"
                className={({ isActive }) =>
                  `block text-sm transition-colors ${
                    isActive
                      ? "text-yellow-400"
                      : "text-slate-400 hover:text-white"
                  }`
                }
              >
                Chia sẻ
              </NavLink>
              <NavLink
                to="/updates"
                className={({ isActive }) =>
                  `block text-sm transition-colors ${
                    isActive
                      ? "text-yellow-400"
                      : "text-slate-400 hover:text-white"
                  }`
                }
              >
                Cập nhật
              </NavLink>
            </nav>
          </div>

          {/* Latest Updates */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Cập nhật mới nhất</h3>
            <div className="space-y-3">
              <div className="text-sm">
                <p className="text-yellow-400 font-medium">v2.1.0 - 19/12/2024</p>
                <p className="text-slate-400">Thêm tính năng theo dõi thời gian bán và thống kê Divine</p>
              </div>
              <div className="text-sm">
                <p className="text-yellow-400 font-medium">v2.0.0 - 18/12/2024</p>
                <p className="text-slate-400">Cải thiện giao diện và thêm trang thống kê</p>
              </div>
              <div className="text-sm">
                <p className="text-yellow-400 font-medium">v1.5.0 - 17/12/2024</p>
                <p className="text-slate-400">Hỗ trợ tính toán phức tạp và nhóm giao dịch</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-6 pt-6 text-center">
          <p className="text-slate-400 text-sm">
            © 2024 POE Trading Calculator. Được phát triển với ❤️ cho cộng đồng Path of Exile.
          </p>
        </div>
      </div>
    </footer>
  );
} 