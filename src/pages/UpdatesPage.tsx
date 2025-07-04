import React, { useState } from "react";

const updates = [
  {
    id: 1,
    title: "Tách HomePage thành component riêng, refactor layout",
    content: `- Trang chủ đã được tách thành HomePage riêng biệt\n- Header trở thành main menu\n- Layout tổng thể sử dụng MainLayout\n- Tối ưu hóa code, tách các component lớn thành file riêng`,
    date: "2024-05-30 15:00"
  },
  {
    id: 2,
    title: "Thêm chức năng tìm kiếm toàn cục",
    content: `- Thanh search được đưa ra ngoài Header\n- Chỉ trang Home mới có thanh search\n- Các trang khác giữ layout gọn gàng` ,
    date: "2024-05-30 15:30"
  },
  {
    id: 3,
    title: "Cập nhật giao diện Header và menu",
    content: `- Thêm lại logo và brand\n- Menu điều hướng rõ ràng\n- Responsive tốt trên mọi thiết bị` ,
    date: "2024-05-30 16:00"
  }
];

const UpdatesPage: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center">Lịch sử cập nhật</h2>
      <div className="space-y-4">
        {updates.map(update => (
          <div key={update.id} className="border border-slate-700 rounded-lg bg-slate-800/70">
            <button
              className="w-full flex justify-between items-center px-4 py-3 text-left focus:outline-none focus:bg-slate-700 rounded-t-lg"
              onClick={() => setOpenId(openId === update.id ? null : update.id)}
            >
              <span className="font-semibold text-slate-200">{update.title}</span>
              <span className="text-xs text-slate-400 ml-4">{update.date}</span>
              <span className={`ml-2 transition-transform ${openId === update.id ? 'rotate-90' : ''}`}>▶</span>
            </button>
            {openId === update.id && (
              <div className="px-6 py-4 border-t border-slate-700 bg-slate-900/80 rounded-b-lg text-slate-300 whitespace-pre-line">
                {update.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpdatesPage;