import React from "react";
import { Search } from "lucide-react";

interface NoSearchResultProps {
  setSearchTerm: (v: string) => void;
  showInfoToast: (msg: string) => void;
  TOAST_MESSAGES: any;
}

const NoSearchResult: React.FC<NoSearchResultProps> = ({ setSearchTerm, showInfoToast, TOAST_MESSAGES }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
      <Search className="w-8 h-8 text-slate-400" />
    </div>
    <h3 className="text-lg font-medium text-slate-300 mb-2">Không tìm thấy giao dịch</h3>
    <p className="text-slate-400 mb-4">Thử tìm kiếm với từ khóa khác</p>
    <button
      onClick={() => {
        setSearchTerm("");
        showInfoToast(TOAST_MESSAGES.SEARCH_CLEARED);
      }}
      className="text-yellow-400 hover:text-yellow-300 font-medium"
    >
      Xóa bộ lọc
    </button>
  </div>
);

export default NoSearchResult; 