import React from "react";
import { Link } from "react-router-dom";
import { Share2, Download, Users, Lock } from "lucide-react";

const SharesPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 px-6 py-3 bg-yellow-400/10 text-yellow-400 rounded-lg font-semibold mb-6 border border-yellow-400/20">
          <Share2 className="w-5 h-5" />
          <span>Chia sẻ cộng đồng</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Chia sẻ dữ liệu giao dịch</h2>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Kết nối với cộng đồng POE trader, chia sẻ kinh nghiệm và học hỏi từ những người khác
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Share2 className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Chia sẻ dữ liệu</h3>
          <p className="text-slate-400 text-sm">
            Chia sẻ file export giao dịch và profit của bạn cho cộng đồng
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Download className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Tải về dữ liệu</h3>
          <p className="text-slate-400 text-sm">
            Tải về file export của người khác để nhập vào app
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Tham khảo cộng đồng</h3>
          <p className="text-slate-400 text-sm">
            Xem và tham khảo các giao dịch nổi bật từ cộng đồng
          </p>
        </div>
      </div>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-yellow-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">Tính năng đang phát triển</h3>
        <p className="text-slate-300 mb-6 max-w-lg mx-auto">
          Tính năng chia sẻ cộng đồng đang được phát triển và sẽ sớm ra mắt. 
          Bạn cần đăng nhập để sử dụng tính năng này.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/login"
            className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Đăng nhập để chia sẻ</span>
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Tạo tài khoản mới</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SharesPage;