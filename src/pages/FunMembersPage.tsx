import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PublicUser {
  uid: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
}

const FunMembersPage: React.FC = () => {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const q = query(collection(db, 'public_users'), orderBy('createdAt', 'asc'));
      const snapshot = await getDocs(q);
      const data: PublicUser[] = snapshot.docs.map(doc => doc.data() as PublicUser);
      setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-slate-400 hover:text-yellow-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            <span className="text-sm">Quay lại trang chủ</span>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Danh sách thành viên đã tham gia</h1>
        {loading ? (
          <div className="text-center text-slate-400">Đang tải...</div>
        ) : users.length === 0 ? (
          <div className="text-center text-slate-400">Chưa có ai tham gia!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {users.map(user => (
              <div key={user.uid} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold text-white">{user.displayName}</div>
                  <div className="text-slate-500 text-xs mt-1">Tham gia: {user.createdAt ? new Date(user.createdAt).toLocaleString('vi-VN') : ''}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FunMembersPage; 