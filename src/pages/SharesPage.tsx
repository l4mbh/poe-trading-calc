import React from "react";

const SharesPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto py-16 text-center">
      <div className="inline-block px-6 py-3 bg-yellow-100 text-yellow-800 rounded-lg font-semibold mb-6">
        🚧 Trang này đang được phát triển!
      </div>
      <h2 className="text-2xl font-bold text-yellow-500 mb-4">Chia sẻ dữ liệu giao dịch</h2>
      <p className="text-slate-300 mb-4">
        Trang này sẽ là nơi bạn có thể <span className="text-yellow-400 font-semibold">chia sẻ các bản export</span> dữ liệu giao dịch, profit của mình cho cộng đồng, hoặc tải về các bản export của người dùng khác để sử dụng, tham khảo.
      </p>
      <ul className="text-slate-400 text-left max-w-lg mx-auto mb-8 list-disc list-inside">
        <li>Chia sẻ file export giao dịch/profit của bạn cho mọi người.</li>
        <li>Tải về file export của người khác để nhập vào app.</li>
        <li>Xem và tham khảo các giao dịch, profit nổi bật từ cộng đồng.</li>
      </ul>
      <div className="text-slate-500 italic">Tính năng này sẽ sớm ra mắt. Hãy quay lại sau!</div>
    </div>
  );
};

export default SharesPage;