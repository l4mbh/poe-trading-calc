import React, { useState } from "react";
import { Settings, X } from "lucide-react";

interface SettingsModalProps {
  showExchangeRate: boolean;
  showTotalProfit: boolean;
  onToggleExchangeRate: () => void;
  onToggleTotalProfit: () => void;
  showSidebar?: boolean;
  onToggleSidebar?: () => void;
  enableApiCalls?: boolean;
  onToggleApiCalls?: () => void;
}

export function SettingsModal({
  showExchangeRate,
  showTotalProfit,
  onToggleExchangeRate,
  onToggleTotalProfit,
  showSidebar = true,
  onToggleSidebar,
  enableApiCalls = true,
  onToggleApiCalls,
}: SettingsModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Settings Button */}
      <button
        onClick={toggleModal}
        className="fixed bottom-6 right-6 w-14 h-14 bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 flex items-center justify-center"
        title="Cài đặt"
      >
        <Settings className="w-6 h-6" />
      </button>

      {/* Settings Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Cài đặt</h2>
              <button
                onClick={toggleModal}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Header Display Settings */}
              <div>
                <h3 className="text-lg font-medium text-slate-200 mb-4">
                  Hiển thị trên Header
                </h3>
                <div className="space-y-4">
                  {/* Exchange Rate Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-300">
                        Hiển thị tỷ giá
                      </div>
                      <div className="text-xs text-slate-500">
                        Hiển thị tỷ giá Divine/Chaos trên header
                      </div>
                    </div>
                    <button
                      onClick={onToggleExchangeRate}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        showExchangeRate
                          ? "bg-yellow-500"
                          : "bg-slate-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          showExchangeRate ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Total Profit Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-300">
                        Hiển thị tổng lợi nhuận
                      </div>
                      <div className="text-xs text-slate-500">
                        Hiển thị tổng lợi nhuận trên header
                      </div>
                    </div>
                    <button
                      onClick={onToggleTotalProfit}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        showTotalProfit
                          ? "bg-yellow-500"
                          : "bg-slate-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          showTotalProfit ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* API Settings */}
              {onToggleApiCalls && (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-300">
                      Cho phép gọi API
                    </div>
                    <div className="text-xs text-slate-500">
                      Cho phép tự động lấy tỷ giá từ POE Ninja API
                    </div>
                  </div>
                  <button
                    onClick={onToggleApiCalls}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      enableApiCalls
                        ? "bg-yellow-500"
                        : "bg-slate-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        enableApiCalls ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Sidebar Toggle */}
              {onToggleSidebar && (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-300">
                      Hiển thị sidebar
                    </div>
                    <div className="text-xs text-slate-500">
                      Hiển thị sidebar bên trái với tỷ giá và lợi nhuận
                    </div>
                  </div>
                  <button
                    onClick={onToggleSidebar}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showSidebar
                        ? "bg-yellow-500"
                        : "bg-slate-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        showSidebar ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Future Settings Placeholder */}
              <div className="border-t border-slate-700 pt-6">
                <h3 className="text-lg font-medium text-slate-200 mb-4">
                  Cài đặt khác
                </h3>
                <div className="text-sm text-slate-500">
                  Các cài đặt khác sẽ được thêm vào đây trong tương lai...
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 