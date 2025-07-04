import React, { useState } from "react";

const updates = [
  {
    id: 1,
    title: "🆕 Widget tỷ giá & lợi nhuận trên menu chính",
    content: `- Thêm widget tỷ giá Divine/Chaos và tổng lợi nhuận thu gọn trên menu chính\n- Có thể mở rộng để chỉnh tỷ giá, chọn league, reload API\n- Tùy chỉnh hiển thị widget qua nút cài đặt (góc phải dưới)`
  },
  {
    id: 2,
    title: "🔄 Tỷ giá tự động & chọn league",
    content: `- Tỷ giá Divine/Chaos tự động lấy từ POE Ninja API\n- Có thể chọn league, chỉnh thủ công hoặc reload tỷ giá\n- Lưu toàn bộ cài đặt vào localStorage, tự động khôi phục khi mở lại app`
  },
  {
    id: 3,
    title: "📊 Thống kê nâng cao & hiển thị Divine",
    content: `- Trang thống kê hiển thị lợi nhuận chính bằng Divine Orb\n- Thêm bộ lọc, nhóm, và thống kê thời gian bán\n- Hiển thị giao dịch tốt nhất, tệ nhất, thời gian bán trung bình`
  },
  {
    id: 4,
    title: "🎨 Giao diện hiện đại, tối ưu mobile",
    content: `- Giao diện mới, màu sắc rõ ràng, tối ưu cho điện thoại\n- Các nút thao tác lớn, dễ bấm, menu luôn hiển thị\n- Tối ưu hiệu năng và trải nghiệm người dùng`
  },
  {
    id: 5,
    title: "💾 Lưu trữ & xuất nhập dữ liệu an toàn",
    content: `- Tất cả dữ liệu và cài đặt được lưu tự động trên trình duyệt\n- Có thể xuất/nhập dữ liệu giao dịch, nhóm, cài đặt\n- Không cần đăng nhập, bảo mật tuyệt đối`
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