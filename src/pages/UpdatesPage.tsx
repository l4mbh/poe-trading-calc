import React, { useState } from "react";

const updates = [
  {
    id: 1,
    title: "Giao diện mới hiện đại, dễ sử dụng",
    content: `- Giao diện được làm mới, màu sắc rõ ràng, dễ nhìn hơn\n- Menu chính luôn hiển thị ở đầu trang, dễ dàng chuyển trang` ,
    date: "2024-05-30 17:00"
  },
  {
    id: 2,
    title: "Thêm thanh tìm kiếm tiện lợi",
    content: `- Có thể tìm kiếm nhanh các giao dịch ngay trên trang chủ\n- Tìm kiếm theo tên giao dịch, thao tác mượt mà` ,
    date: "2024-05-30 17:10"
  },
  {
    id: 3,
    title: "Trang Chia sẻ và Cập nhật",
    content: `- Trang Chia sẻ: nơi bạn có thể chia sẻ hoặc tải về dữ liệu giao dịch từ cộng đồng (sắp ra mắt)\n- Trang Cập nhật: xem lại các thay đổi mới nhất của ứng dụng` ,
    date: "2024-05-30 17:15"
  },
  {
    id: 4,
    title: "Tối ưu trải nghiệm trên điện thoại",
    content: `- Giao diện tự động điều chỉnh phù hợp với màn hình nhỏ\n- Các nút bấm, menu dễ thao tác trên di động` ,
    date: "2024-05-30 17:20"
  },
  {
    id: 5,
    title: "Quản lý nhóm giao dịch dễ dàng",
    content: `- Có thể tạo nhiều nhóm để phân loại giao dịch\n- Di chuyển, chỉnh sửa, xóa nhóm nhanh chóng` ,
    date: "2024-05-30 17:30"
  },
  {
    id: 6,
    title: "Xem giao dịch dạng bảng hoặc thẻ",
    content: `- Tuỳ chọn xem giao dịch theo dạng bảng (table) hoặc thẻ (card)\n- Dễ dàng chuyển đổi chỉ với một nút bấm` ,
    date: "2024-05-30 17:35"
  },
  {
    id: 7,
    title: "Xuất/Nhập dữ liệu tiện lợi",
    content: `- Có thể xuất toàn bộ dữ liệu giao dịch ra file để lưu trữ hoặc chia sẻ\n- Nhập lại dữ liệu từ file chỉ với vài thao tác` ,
    date: "2024-05-30 17:40"
  },
  {
    id: 8,
    title: "Thông báo tự động, thao tác nhanh",
    content: `- Hiển thị thông báo khi thêm, xóa, chỉnh sửa giao dịch hoặc nhóm\n- Thao tác mượt mà, phản hồi tức thì` ,
    date: "2024-05-30 17:45"
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