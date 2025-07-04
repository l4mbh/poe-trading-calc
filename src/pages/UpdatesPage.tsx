import React, { useState } from "react";

const updates = [
  {
    id: 1,
    title: "🎯 Theo dõi thời gian bán hàng",
    content: `- Thêm nút "Treo bán" để đánh dấu khi bắt đầu bán item\n- Tự động tính thời gian từ lúc treo bán đến lúc bán thành công\n- Hiển thị thời gian bán trong thống kê (đơn vị giờ)\n- Giúp phân tích hiệu quả thời gian bán hàng của bạn`
  },
  {
    id: 2,
    title: "📊 Thống kê theo Divine Orb",
    content: `- Trang thống kê hiển thị lợi nhuận chính bằng Divine Orb\n- Chaos Orb vẫn được hiển thị như đơn vị phụ\n- Thống kê thời gian bán trung bình\n- Hiển thị giao dịch tốt nhất và tệ nhất với thời gian bán`
  },
  {
    id: 3,
    title: "🎨 Cải thiện giao diện footer",
    content: `- Bỏ phần trạng thái thừa trong footer giao dịch\n- Thay text "divine" và "chaos" bằng ảnh trực quan\n- Giao diện gọn gàng và dễ nhìn hơn\n- Footer layout với thông tin cập nhật và link Discord/GitHub`
  },
  {
    id: 4,
    title: "🔄 Nút Đã bán thông minh",
    content: `- Khi click "Đã bán", giao dịch được lưu vào thống kê và reset về trạng thái ban đầu\n- Tự động tính toán thời gian bán nếu đã treo bán trước đó\n- Thông báo toast với thông tin lợi nhuận và thời gian bán\n- Dữ liệu được lưu theo ngày để phân tích xu hướng`
  },
  {
    id: 5,
    title: "📈 Trang thống kê chi tiết",
    content: `- Thêm trang thống kê với bộ lọc theo ngày\n- Hiển thị tổng lợi nhuận, lợi nhuận trung bình\n- Thống kê số giao dịch có lãi/lỗ\n- Bảng chi tiết tất cả giao dịch đã hoàn thành`
  },
  {
    id: 6,
    title: "🎯 Giao diện mới hiện đại, dễ sử dụng",
    content: `- Giao diện được làm mới, màu sắc rõ ràng, dễ nhìn hơn\n- Menu chính luôn hiển thị ở đầu trang, dễ dàng chuyển trang`
  },
  {
    id: 7,
    title: "🔍 Thêm thanh tìm kiếm tiện lợi",
    content: `- Có thể tìm kiếm nhanh các giao dịch ngay trên trang chủ\n- Tìm kiếm theo tên giao dịch, thao tác mượt mà`
  },
  {
    id: 8,
    title: "📱 Tối ưu trải nghiệm trên điện thoại",
    content: `- Giao diện tự động điều chỉnh phù hợp với màn hình nhỏ\n- Các nút bấm, menu dễ thao tác trên di động`
  },
  {
    id: 9,
    title: "📁 Quản lý nhóm giao dịch dễ dàng",
    content: `- Có thể tạo nhiều nhóm để phân loại giao dịch\n- Di chuyển, chỉnh sửa, xóa nhóm nhanh chóng`
  },
  {
    id: 10,
    title: "📋 Xem giao dịch dạng bảng hoặc thẻ",
    content: `- Tuỳ chọn xem giao dịch theo dạng bảng (table) hoặc thẻ (card)\n- Dễ dàng chuyển đổi chỉ với một nút bấm`
  },
  {
    id: 11,
    title: "💾 Xuất/Nhập dữ liệu tiện lợi",
    content: `- Có thể xuất toàn bộ dữ liệu giao dịch ra file để lưu trữ hoặc chia sẻ\n- Nhập lại dữ liệu từ file chỉ với vài thao tác`
  },
  {
    id: 12,
    title: "🔔 Thông báo tự động, thao tác nhanh",
    content: `- Hiển thị thông báo khi thêm, xóa, chỉnh sửa giao dịch hoặc nhóm\n- Thao tác mượt mà, phản hồi tức thì`
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