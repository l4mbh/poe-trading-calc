import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { TrendingUp, TrendingDown, Calendar, DollarSign, BarChart3 } from 'lucide-react';
import { CURRENCY_IMAGES } from '../utils/constants';
import { showErrorToast, showSuccessToast } from '../utils/toastUtils';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface SharedStatistics {
  id: string;
  userId: string;
  displayName: string;
  shareDate: string;
  createdAt: string;
  transactions: Array<{
    name: string;
    buyQuantity: number;
    buyPrice: number;
    sellQuantity: number;
    sellPrice: number;
    profit: number;
    profitPercentage: number;
    iconUrl?: string;
  }>;
  summary: {
    totalProfit: number;
    totalTransactions: number;
    profitableTransactions: number;
    lossTransactions: number;
    averageProfit: number;
  };
}

export default function SharesPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [sharedStats, setSharedStats] = useState<SharedStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShare, setSelectedShare] = useState<SharedStatistics | null>(null);
  const [userFilter, setUserFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  // State để xác định mở modal chi tiết từ nút 'Xem thêm bình luận'
  const [openCommentsFor, setOpenCommentsFor] = useState<string | null>(null);

  useEffect(() => {
    loadSharedStatistics();
  }, []);

  const loadSharedStatistics = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'shared_statistics'), orderBy('createdAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      const stats: SharedStatistics[] = [];
      querySnapshot.forEach((doc) => {
        stats.push({ id: doc.id, ...doc.data() } as SharedStatistics);
      });
      setSharedStats(stats);
    } catch (error) {
      console.error('Error loading shared statistics:', error);
      showErrorToast('Không thể tải thống kê chia sẻ');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatProfit = (profit: number, isDivine: boolean = false) => {
    const isPositive = profit >= 0;
    return (
      <span className={`font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '+' : ''}{profit.toFixed(isDivine ? 3 : 2)}
      </span>
    );
  };

  const visibleStats = currentUser ? sharedStats : sharedStats.slice(0, 3);
  const filteredStats = visibleStats.filter(stat =>
    (!userFilter || stat.displayName.toLowerCase().includes(userFilter.toLowerCase())) &&
    (!dateFilter || stat.shareDate === dateFilter)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Đang tải thống kê chia sẻ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Nếu chưa đăng nhập, hiện block giới thiệu */}
        {!currentUser && (
          <div className="mb-8 bg-slate-800/70 border border-yellow-400/30 rounded-xl p-6 text-center">
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">Lợi ích khi đăng nhập & chia sẻ</h2>
            <ul className="text-slate-300 text-base mb-4 space-y-1 list-disc list-inside text-left max-w-xl mx-auto">
              <li>Xem thống kê giao dịch cộng đồng, học hỏi kinh nghiệm thực tế</li>
              <li>Chia sẻ thành tích, so sánh hiệu quả giao dịch với người khác</li>
              <li>Lưu trữ và đồng bộ dữ liệu an toàn trên cloud</li>
              <li>Tham gia các sự kiện, bảng xếp hạng, nhận phần thưởng (nếu có)</li>
            </ul>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center space-x-2 px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold rounded-lg transition-colors"
            >
              <span>Đăng nhập để chia sẻ & trải nghiệm</span>
            </button>
          </div>
        )}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Thống kê chia sẻ</h1>
          <p className="text-slate-400">Xem thống kê giao dịch được chia sẻ bởi cộng đồng</p>
        </div>

        {/* Filter UI khi đã đăng nhập */}
        {currentUser && (
          <div className="flex flex-wrap gap-4 mb-6">
            <input
              type="text"
              placeholder="Lọc theo tên người dùng"
              value={userFilter}
              onChange={e => setUserFilter(e.target.value)}
              className="px-3 py-2 rounded bg-slate-700 text-white border border-slate-600"
            />
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="px-3 py-2 rounded bg-slate-700 text-white border border-slate-600"
            />
          </div>
        )}

        {filteredStats.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">Không có thống kê phù hợp</h3>
            <p className="text-slate-400">Thay đổi bộ lọc để tìm thống kê khác!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {filteredStats.map((stat) => (
              <div
                key={stat.id}
                className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 hover:border-yellow-400 transition-colors p-6 mb-2"
              >
                {/* Header: Avatar, tên, ngày, nút xem chi tiết */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <img
                      src={'/default-avatar.png'}
                      alt="avatar"
                      className="w-10 h-10 rounded-full mr-3 border border-slate-700 object-cover"
                    />
                    <div>
                      <div className="font-semibold text-white">{stat.displayName}</div>
                      <div className="text-xs text-slate-400">{formatDate(stat.shareDate)}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        showErrorToast('Bạn cần đăng nhập để xem chi tiết thống kê!');
                        return;
                      }
                      setSelectedShare(stat);
                    }}
                    className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold transition-colors shadow border border-yellow-400"
                  >
                    Xem chi tiết
                  </button>
                </div>
                {/* Số liệu nổi bật */}
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-1 text-yellow-400 font-bold text-lg">
                    <DollarSign className="w-5 h-5" />
                    {formatProfit(stat.summary.totalProfit / 200, true)}
                    <img src={CURRENCY_IMAGES.divine} alt="Divine Orb" className="w-5 h-5 ml-1" />
                  </div>
                  <div className="flex items-center gap-1 text-blue-400 font-bold text-lg">
                    <BarChart3 className="w-5 h-5" />
                    {formatProfit(stat.summary.averageProfit / 200, true)}
                    <img src={CURRENCY_IMAGES.divine} alt="Divine Orb" className="w-5 h-5 ml-1" />
                  </div>
                  <div className="flex items-center gap-1 text-green-400 font-bold text-lg">
                    <TrendingUp className="w-5 h-5" />
                    {stat.summary.profitableTransactions}
                  </div>
                  <div className="flex items-center gap-1 text-red-400 font-bold text-lg">
                    <TrendingDown className="w-5 h-5" />
                    {stat.summary.lossTransactions}
                  </div>
                  <div className="flex items-center gap-1 text-slate-300 font-bold text-lg">
                    <Calendar className="w-5 h-5" />
                    {stat.summary.totalTransactions}
                  </div>
                </div>
                {/* CommentSection */}
                <div className="flex-1">
                  <CommentSection shareId={stat.id} currentUser={currentUser} showAll={openCommentsFor === stat.id} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for detailed view */}
        {selectedShare && currentUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
              {/* Sticky Header */}
              <div className="p-6 border-b border-slate-700 sticky top-0 z-10 bg-slate-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Thống kê chi tiết - {selectedShare.displayName}
                  </h2>
                  <button
                    onClick={() => { setSelectedShare(null); setOpenCommentsFor(null); }}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-slate-400 mt-1">
                  {formatDate(selectedShare.shareDate)} • {selectedShare.summary.totalTransactions} giao dịch
                </p>
              </div>
              {/* Nội dung cuộn */}
              <div className="p-6 overflow-y-auto flex-1">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-yellow-400" />
                      <span className="text-slate-400 text-sm">Tổng lợi nhuận</span>
                    </div>
                    <div className="mt-2 flex items-center space-x-1">
                      {formatProfit(selectedShare.summary.totalProfit / 200, true)}
                      <img src={CURRENCY_IMAGES.divine} alt="Divine Orb" className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      <span className="text-slate-400 text-sm">Trung bình</span>
                    </div>
                    <div className="mt-2 flex items-center space-x-1">
                      {formatProfit(selectedShare.summary.averageProfit / 200, true)}
                      <img src={CURRENCY_IMAGES.divine} alt="Divine Orb" className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <span className="text-slate-400 text-sm">Có lãi</span>
                    </div>
                    <div className="mt-2 text-green-400 font-bold">
                      {selectedShare.summary.profitableTransactions}
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="w-5 h-5 text-red-400" />
                      <span className="text-slate-400 text-sm">Lỗ</span>
                    </div>
                    <div className="mt-2 text-red-400 font-bold">
                      {selectedShare.summary.lossTransactions}
                    </div>
                  </div>
                </div>
                {/* Transactions List */}
                <div className="space-y-2 mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Danh sách giao dịch</h3>
                  {selectedShare.transactions.map((transaction, index) => (
                    <div key={index} className="bg-slate-700/50 rounded-lg p-4 flex items-center">
                      {/* Hiển thị icon nếu có */}
                      {transaction.iconUrl && (
                        <img
                          src={transaction.iconUrl}
                          alt=""
                          className="w-8 h-8 mr-3 rounded"
                          style={{ objectFit: 'contain' }}
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{transaction.name}</h4>
                        <p className="text-slate-400 text-sm">
                          {transaction.buyQuantity} × {transaction.buyPrice} → {transaction.sellQuantity} × {transaction.sellPrice}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          {formatProfit(transaction.profit / 200, true)}
                          <img src={CURRENCY_IMAGES.divine} alt="Divine Orb" className="w-4 h-4" />
                        </div>
                        <p className="text-slate-400 text-sm">
                          {formatProfit(transaction.profit)} chaos ({transaction.profitPercentage.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* CommentSection full */}
                <CommentSection shareId={selectedShare.id} currentUser={currentUser} showAll={openCommentsFor === selectedShare.id} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// CommentSection component
function CommentSection({ shareId, currentUser, showAll = false }: { shareId: string, currentUser: { uid: string, displayName?: string, email?: string, photoURL?: string } | null, showAll?: boolean }) {
  type CommentItem = {
    id: string;
    userId: string;
    displayName: string;
    avatar: string;
    content: string;
    createdAt: { toDate: () => Date } | Date;
    parentId?: string | null;
  };
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showAllComments, setShowAllComments] = useState(showAll); // Sử dụng showAll từ prop

  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'shared_statistics', shareId, 'comments'), orderBy('createdAt', 'asc'), limit(100));
        const snap = await getDocs(q);
        setComments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)));
      } catch (e) {
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    loadComments();
  }, [shareId]);

  // Lưu comment, có parentId nếu là reply
  const handleAddComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim() || !currentUser) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'shared_statistics', shareId, 'comments'), {
        userId: currentUser.uid,
        displayName: currentUser.displayName || currentUser.email,
        avatar: currentUser.photoURL || '/default-avatar.png',
        content: content.trim(),
        createdAt: serverTimestamp(),
        parentId: replyTo || null,
      });
      setContent('');
      setReplyTo(null);
      // Reload comments
      const q = query(collection(db, 'shared_statistics', shareId, 'comments'), orderBy('createdAt', 'asc'), limit(100));
      const snap = await getDocs(q);
      setComments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)));
      showSuccessToast(replyTo ? 'Đã trả lời bình luận thành công!' : 'Đã gửi bình luận thành công!');
    } finally {
      setSending(false);
    }
  };

  // Bình luận gốc (parentId == null)
  const rootComments = comments.filter(c => !c.parentId);
  // Hiện 2 bình luận đầu, có nút xem thêm
  const visibleComments = showAllComments ? rootComments : rootComments.slice(0, 2);

  return (
    <div className="w-full mt-4 border-t border-slate-700 pt-4">
      <h4 className="font-semibold text-slate-300 mb-2">Bình luận</h4>
      {loading ? (
        <div className="text-slate-400 text-sm">Đang tải bình luận...</div>
      ) : (
        <div className="space-y-2 mb-2">
          {visibleComments.length === 0 && <div className="text-slate-500 text-sm">Chưa có bình luận nào</div>}
          {visibleComments.map(c => (
            <CommentItem key={c.id} comment={c} comments={comments} setReplyTo={setReplyTo} replyTo={replyTo} currentUser={currentUser} />
          ))}
          {rootComments.length > 2 && !showAllComments && (
            <button className="text-yellow-400 text-sm mt-2" onClick={() => {
              setShowAllComments(true);
            }}>
              Xem thêm bình luận ({rootComments.length - 2})
            </button>
          )}
        </div>
      )}
      {currentUser && (
        <form onSubmit={handleAddComment} className="flex gap-2 mt-2">
          <input
            type="text"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={replyTo ? "Trả lời bình luận..." : "Viết bình luận..."}
            className="flex-1 px-3 py-2 rounded bg-slate-700 text-white border border-slate-600"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !content.trim()}
            className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold transition-colors disabled:opacity-50"
          >
            {replyTo ? "Trả lời" : "Gửi"}
          </button>
          {replyTo && (
            <button type="button" onClick={() => setReplyTo(null)} className="text-xs text-slate-400 ml-2">Hủy</button>
          )}
        </form>
      )}
    </div>
  );
}

// Hiển thị 1 bình luận và các reply lồng nhau (1 cấp)
function CommentItem({ comment, comments, setReplyTo, replyTo, currentUser }: {
  comment: Comment, comments: Comment[], setReplyTo: (id: string) => void, replyTo: string | null, currentUser: { uid: string, displayName?: string | null, email?: string | null, photoURL?: string | null } | null
}) {
  const replies = comments.filter(c => c.parentId === comment.id);
  return (
    <div className="mb-2">
      <div className="flex items-start">
        <img src={comment.avatar} className="w-7 h-7 rounded-full mr-2" />
        <div>
          <div className="text-sm font-medium text-white">{comment.displayName}</div>
          <div className="text-xs text-slate-400">{comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleString('vi-VN') : ''}</div>
          <div className="text-slate-200 mb-1">{comment.content}</div>
          {currentUser && (
            <button
              className="text-xs text-yellow-400 hover:underline"
              onClick={() => setReplyTo(comment.id)}
              disabled={replyTo === comment.id}
            >
              Trả lời
            </button>
          )}
        </div>
      </div>
      {/* Reply lồng nhau */}
      {replies.length > 0 && (
        <div className="ml-8 mt-1 border-l border-slate-700 pl-3">
          {replies.map(r => (
            <div key={r.id} className="mb-1">
              <div className="flex items-start">
                <img src={r.avatar} className="w-6 h-6 rounded-full mr-2" />
                <div>
                  <div className="text-xs font-medium text-white">{r.displayName}</div>
                  <div className="text-xs text-slate-400">{r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString('vi-VN') : ''}</div>
                  <div className="text-slate-200">{r.content}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}