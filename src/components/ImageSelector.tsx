import React, { useState, useEffect } from "react";
import { X, Search, Loader2, Image as ImageIcon } from "lucide-react";
import {
  fetchPoeNinjaIcons,
  IconItem,
  IconType,
  ICON_TYPES,
} from "../utils/apiService";
import { showErrorToast, showSuccessToast } from "../utils/toastUtils";

interface ImageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (
    iconId: string,
    iconType: string,
    iconUrl: string,
    iconName?: string
  ) => void;
  currentLeague: string;
  currentIcon?: {
    id: string;
    type: string;
    url: string;
  };
}

export function ImageSelector({
  isOpen,
  onClose,
  onSelect,
  currentLeague,
  currentIcon,
}: ImageSelectorProps) {
  const [selectedType, setSelectedType] = useState<IconType>("Currency");
  const [icons, setIcons] = useState<IconItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [useIconNameAsTransactionName, setUseIconNameAsTransactionName] =
    useState(true);

  // Filter icons based on search term
  const filteredIcons = icons.filter((icon) =>
    icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load icons when type changes
  useEffect(() => {
    if (isOpen && selectedType) {
      loadIcons(selectedType);
    }
  }, [isOpen, selectedType, currentLeague]);

  const loadIcons = async (type: IconType) => {
    setLoading(true);
    setError(null);

    try {
      const iconData = await fetchPoeNinjaIcons(currentLeague, type);
      setIcons(iconData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi không xác định";
      setError(errorMessage);
      showErrorToast(`Không thể tải danh sách icons: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleIconSelect = (icon: IconItem) => {
    onSelect(
      icon.id.toString(),
      selectedType,
      icon.icon,
      useIconNameAsTransactionName ? icon.name : undefined
    );
    showSuccessToast(`Đã chọn icon: ${icon.name}`);
    // onClose() sẽ được gọi từ TransactionCard
  };

  const handleRemoveIcon = () => {
    onSelect("", "", "");
    showSuccessToast("Đã xóa icon");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Chọn Icon</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Icon */}
        {currentIcon?.url && (
          <div className="p-4 border-b border-slate-700 bg-slate-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={currentIcon.url}
                  alt="Current icon"
                  className="w-8 h-8 rounded"
                />
                <span className="text-white font-medium">Icon hiện tại</span>
                <span className="text-slate-400 text-sm">
                  ({currentIcon.type})
                </span>
              </div>
              <button
                onClick={handleRemoveIcon}
                className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded border border-red-400/30 hover:border-red-300/50 transition-colors"
              >
                Xóa icon
              </button>
            </div>
          </div>
        )}

        {/* Type Selector */}
        <div className="p-4 border-b border-slate-700">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Loại item
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as IconType)}
            className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-yellow-400 focus:outline-none"
          >
            {ICON_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-700">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm icon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg pl-10 pr-4 py-2 border border-slate-600 focus:border-yellow-400 focus:outline-none"
            />
          </div>

          {/* Checkbox sử dụng tên icon làm tên giao dịch */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="useIconName"
              checked={useIconNameAsTransactionName}
              onChange={(e) =>
                setUseIconNameAsTransactionName(e.target.checked)
              }
              className="w-4 h-4 text-yellow-400 bg-slate-700 border-slate-600 rounded focus:ring-yellow-400 focus:ring-2"
            />
            <label
              htmlFor="useIconName"
              className="text-sm text-slate-300 cursor-pointer"
            >
              Sử dụng tên icon làm tên giao dịch
            </label>
          </div>
        </div>

        {/* Icons Grid */}
        <div
          className="p-4 overflow-y-auto max-h-[200px] pt-8 px-10"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
              <span className="ml-2 text-slate-400">Đang tải icons...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ImageIcon className="w-12 h-12 text-slate-600 mb-4" />
              <p className="text-red-400 text-center">{error}</p>
              <button
                onClick={() => loadIcons(selectedType)}
                className="mt-4 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-colors"
              >
                Thử lại
              </button>
            </div>
          ) : filteredIcons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ImageIcon className="w-12 h-12 text-slate-600 mb-4" />
              <p className="text-slate-400 text-center">
                {searchTerm
                  ? "Không tìm thấy icon phù hợp"
                  : "Không có icon nào"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-6 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-3">
              {filteredIcons.map((icon) => (
                <button
                  key={icon.id}
                  onClick={() => handleIconSelect(icon)}
                  className="group relative aspect-square bg-slate-700/50 rounded-lg border border-slate-600 hover:border-yellow-400 transition-all duration-200 p-1 min-h-[40px] min-w-[40px]"
                  title={icon.name}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={icon.icon}
                      alt={icon.name}
                      className="max-w-full max-h-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        // Thay thế bằng icon chấm than
                        target.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjNjM2MzYzIi8+CjxwYXRoIGQ9Ik0xMiA4VjE2TTggMTJIMTYiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+";
                        target.alt = "Icon not found";
                      }}
                    />
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {icon.name}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">
              {filteredIcons.length} icons
              {searchTerm && ` (lọc từ ${icons.length})`}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
