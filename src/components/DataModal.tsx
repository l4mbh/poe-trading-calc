import React from 'react';
import { X, Download, Upload, FileText, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { ExportData } from '../types';

interface DataModalProps {
  showDataModal: boolean;
  modalTab: 'export' | 'import';
  isExporting: boolean;
  isImporting: boolean;
  importStatus: 'idle' | 'success' | 'error';
  importError: string;
  transactions: any[];
  groups: any[];
  divineToChaoRate: number;
  onClose: () => void;
  onTabChange: (tab: 'export' | 'import') => void;
  onExport: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DataModal({
  showDataModal,
  modalTab,
  isExporting,
  isImporting,
  importStatus,
  importError,
  transactions,
  groups,
  divineToChaoRate,
  onClose,
  onTabChange,
  onExport,
  onFileUpload
}: DataModalProps) {
  if (!showDataModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Quản lý dữ liệu</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => onTabChange('export')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              modalTab === 'export'
                ? 'text-green-400 border-b-2 border-green-400 bg-green-400/5'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Xuất dữ liệu</span>
            </div>
          </button>
          <button
            onClick={() => onTabChange('import')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              modalTab === 'import'
                ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-400/5'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Nhập dữ liệu</span>
            </div>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {modalTab === 'export' ? (
            <div className="space-y-4">
              <div className="text-center">
                <FileText className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-white mb-2">Xuất dữ liệu</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Tải xuống tất cả giao dịch và nhóm của bạn dưới dạng file JSON
                </p>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4 text-sm text-slate-300">
                <div className="flex justify-between mb-2">
                  <span>Số giao dịch:</span>
                  <span className="font-medium">{transactions.length}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Số nhóm:</span>
                  <span className="font-medium">{groups.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tỷ giá hiện tại:</span>
                  <span className="font-medium">{divineToChaoRate} Chaos/Divine</span>
                </div>
              </div>

              <button
                onClick={onExport}
                disabled={isExporting}
                className="w-full bg-green-600 hover:bg-green-500 disabled:bg-green-600/50 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang xuất...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Tải xuống</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <Upload className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-white mb-2">Nhập dữ liệu</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Chọn file JSON đã xuất trước đó để khôi phục dữ liệu
                </p>
              </div>

              {/* Import Status */}
              {importStatus === 'success' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div className="text-green-400 text-sm">
                    Dữ liệu đã được nhập thành công!
                  </div>
                </div>
              )}

              {importStatus === 'error' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-red-400 text-sm">
                    <div className="font-medium mb-1">Lỗi nhập dữ liệu</div>
                    <div>{importError}</div>
                  </div>
                </div>
              )}

              {/* File Upload */}
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-purple-400/50 transition-colors">
                <input
                  type="file"
                  accept=".json"
                  onChange={onFileUpload}
                  disabled={isImporting}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer ${isImporting ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <div className="text-slate-300 font-medium mb-1">
                    {isImporting ? 'Đang xử lý...' : 'Chọn file JSON'}
                  </div>
                  <div className="text-slate-400 text-sm">
                    Kéo thả hoặc click để chọn file
                  </div>
                </label>
              </div>

              {isImporting && (
                <div className="flex items-center justify-center space-x-2 text-purple-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Đang nhập dữ liệu...</span>
                </div>
              )}

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-yellow-400 text-sm">
                <div className="font-medium mb-1">⚠️ Lưu ý quan trọng</div>
                <div>Việc nhập dữ liệu sẽ thay thế hoàn toàn dữ liệu hiện tại. Hãy xuất dữ liệu hiện tại trước khi nhập.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 