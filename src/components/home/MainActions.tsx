import React from "react";
import { Plus, Trash2, Download, Upload, Settings, Folder } from "lucide-react";

interface MainActionsProps {
  addTransaction: () => void;
  isActionsCollapsed: boolean;
  setIsActionsCollapsed: (v: boolean) => void;
  setShowGroupForm: (v: boolean) => void;
  setShowDataModal: (v: boolean) => void;
  setModalTab: (tab: "export" | "import") => void;
  transactions: any[];
  clearAllData: () => void;
  showGroupForm: boolean;
}

const MainActions: React.FC<MainActionsProps> = ({
  addTransaction,
  isActionsCollapsed,
  setIsActionsCollapsed,
  setShowGroupForm,
  setShowDataModal,
  setModalTab,
  transactions,
  clearAllData,
  showGroupForm,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center space-x-4">
        <button
          onClick={addTransaction}
          className="group flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-slate-900 px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
          <span>Thêm giao dịch</span>
        </button>
        <button
          onClick={() => setIsActionsCollapsed(!isActionsCollapsed)}
          className="flex items-center space-x-2 bg-slate-600/20 hover:bg-slate-600/30 text-slate-400 hover:text-slate-300 px-4 py-3 rounded-lg font-medium transition-all duration-200 border border-slate-600/30"
        >
          <Settings className="w-4 h-4" />
          <span>{isActionsCollapsed ? "Hiện thêm" : "Ẩn bớt"}</span>
        </button>
      </div>
      {!isActionsCollapsed && (
        <div className="flex items-center space-x-4 flex-wrap gap-2">
          <button
            onClick={() => setShowGroupForm(!showGroupForm)}
            className="flex items-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 px-4 py-3 rounded-lg font-medium transition-all duration-200 border border-blue-600/30"
          >
            <Folder className="w-4 h-4" />
            <span>Tạo nhóm</span>
          </button>
          <button
            onClick={() => {
              setShowDataModal(true);
              setModalTab("export");
            }}
            className="flex items-center space-x-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 px-4 py-3 rounded-lg font-medium transition-all duration-200 border border-green-600/30"
          >
            <Download className="w-4 h-4" />
            <span>Xuất dữ liệu</span>
          </button>
          <button
            onClick={() => {
              setShowDataModal(true);
              setModalTab("import");
            }}
            className="flex items-center space-x-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 hover:text-purple-300 px-4 py-3 rounded-lg font-medium transition-all duration-200 border border-purple-600/30"
          >
            <Upload className="w-4 h-4" />
            <span>Nhập dữ liệu</span>
          </button>
          {transactions.length > 0 && (
            <button
              onClick={clearAllData}
              className="flex items-center space-x-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 px-4 py-3 rounded-lg font-medium transition-all duration-200 border border-red-600/30"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa tất cả</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MainActions; 