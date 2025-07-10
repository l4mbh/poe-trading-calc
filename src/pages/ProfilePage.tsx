import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle,
  Home,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import { AvatarUpload } from '../components/AvatarUpload';
import { sendEmailVerification } from 'firebase/auth';


export default function ProfilePage() {
  const { currentUser, logout, updateUserProfile, changePassword, deleteUserAccount } = useAuth();
  const navigate = useNavigate();
  
  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [allowShare, setAllowShare] = useState<boolean>(true);
  
  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  // Account deletion states
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sendingVerify, setSendingVerify] = useState(false);

  useEffect(() => {
    // Lấy allowShare từ Firestore nếu có (nếu đã load user)
    if (currentUser && (currentUser as any).allowShare !== undefined) {
      setAllowShare((currentUser as any).allowShare);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      showErrorToast('Tên hiển thị không được để trống');
      return;
    }

    try {
      setIsUpdatingProfile(true);
      await updateUserProfile(displayName.trim(), undefined, allowShare);
      showSuccessToast('Cập nhật thông tin thành công!');
      setIsEditingProfile(false);
    } catch (error: any) {
      console.error('Update profile error:', error);
      showErrorToast('Cập nhật thông tin thất bại');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAvatarChange = async (avatarUrl: string) => {
    try {
      await updateUserProfile(currentUser?.displayName || '', avatarUrl);
      showSuccessToast('Cập nhật avatar thành công!');
    } catch (error: any) {
      console.error('Update avatar error:', error);
      showErrorToast('Cập nhật avatar thất bại');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showErrorToast('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (newPassword.length < 6) {
      showErrorToast('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showErrorToast('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await changePassword(currentPassword, newPassword);
      showSuccessToast('Đổi mật khẩu thành công!');
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      console.error('Change password error:', error);
      let errorMessage = 'Đổi mật khẩu thất bại';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Mật khẩu hiện tại không đúng';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Mật khẩu mới quá yếu (ít nhất 6 ký tự)';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để đổi mật khẩu.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Lỗi mạng. Vui lòng kiểm tra kết nối internet.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Mật khẩu hiện tại không đúng';
      } else if (typeof error.message === 'string' && error.message.includes('recent authentication')) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      }
      showErrorToast(errorMessage);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirmPassword) {
      showErrorToast('Vui lòng nhập mật khẩu để xác nhận');
      return;
    }

    try {
      setIsDeleting(true);
      await deleteUserAccount(deleteConfirmPassword);
      
      showSuccessToast('Tài khoản đã được xóa thành công');
      navigate('/');
    } catch (error: any) {
      console.error('Delete account error:', error);
      
      let errorMessage = 'Xóa tài khoản thất bại';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Mật khẩu không đúng';
      }
      
      showErrorToast(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showSuccessToast('Đăng xuất thành công!');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      showErrorToast('Đăng xuất thất bại');
    }
  };

  const handleSendEmailVerification = async () => {
    if (!currentUser) return;
    try {
      setSendingVerify(true);
      await sendEmailVerification(currentUser);
      showSuccessToast('Đã gửi email xác thực. Vui lòng kiểm tra hộp thư!');
    } catch (error: any) {
      console.error('Send email verification error:', error);
      showErrorToast('Gửi email xác thực thất bại.');
    } finally {
      setSendingVerify(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back to Home Button */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-slate-400 hover:text-yellow-400 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm">Quay lại trang chủ</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">Hồ sơ người dùng</h1>
          <p className="text-slate-400">Quản lý thông tin tài khoản của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Avatar Section */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Avatar</h2>
              <div className="flex items-center space-x-6">
                <AvatarUpload
                  currentAvatarUrl={currentUser?.photoURL}
                  userId={currentUser?.uid || ''}
                  onAvatarChange={handleAvatarChange}
                  size="lg"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-2">
                    {currentUser?.displayName || 'Người dùng'}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Click vào avatar để thay đổi hoặc hover để xem preview
                  </p>
                  <div className="mt-2 text-xs text-slate-500">
                    Hỗ trợ: JPG, PNG, GIF (tối đa 5MB)
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Info Card */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <User className="w-5 h-5 text-yellow-400" />
                  <span>Thông tin cơ bản</span>
                </h2>
                {!isEditingProfile ? (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="flex items-center space-x-1 text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="text-sm">Chỉnh sửa</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={isUpdatingProfile}
                      className="flex items-center space-x-1 text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span className="text-sm">
                        {isUpdatingProfile ? 'Đang lưu...' : 'Lưu'}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingProfile(false);
                        setDisplayName(currentUser?.displayName || '');
                      }}
                      className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span className="text-sm">Hủy</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tên hiển thị
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-yellow-400 focus:outline-none"
                      placeholder="Nhập tên hiển thị"
                    />
                  ) : (
                    <p className="text-white">
                      {currentUser.displayName || 'Chưa có tên hiển thị'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-white">{currentUser.email}</span>
                    {currentUser.emailVerified ? (
                      <span className="flex items-center gap-1 text-green-400 text-xs font-medium"><CheckCircle className="w-4 h-4" /> Đã xác thực</span>
                    ) : (
                      <>
                        <span className="flex items-center gap-1 text-red-400 text-xs font-medium"><AlertCircle className="w-4 h-4" /> Chưa xác thực</span>
                        <button
                          onClick={handleSendEmailVerification}
                          disabled={sendingVerify}
                          className="ml-2 px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded text-xs font-semibold transition-colors disabled:opacity-60"
                        >
                          {sendingVerify ? 'Đang gửi...' : 'Gửi email xác thực'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Ngày tham gia
                  </label>
                  <p className="text-white flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{currentUser.metadata.creationTime ? formatDate(new Date(currentUser.metadata.creationTime)) : ''}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Đăng nhập lần cuối
                  </label>
                  <p className="text-white flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{currentUser.metadata.lastSignInTime ? formatDate(new Date(currentUser.metadata.lastSignInTime)) : ''}</span>
                  </p>
                </div>
              </div>
              {isEditingProfile && (
                <div className="mt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={allowShare}
                      onChange={e => setAllowShare(e.target.checked)}
                    />
                    Cho phép chia sẻ thống kê của tôi với mọi người (vui vẻ)
                  </label>
                </div>
              )}
            </div>

            {/* Change Password Card */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span>Đổi mật khẩu</span>
                </h2>
                <button
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {isChangingPassword ? (
                    <>
                      <X className="w-4 h-4" />
                      <span className="text-sm">Hủy</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4" />
                      <span className="text-sm">Đổi mật khẩu</span>
                    </>
                  )}
                </button>
              </div>

              {isChangingPassword && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 pr-10 border border-slate-600 focus:border-yellow-400 focus:outline-none"
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4 text-slate-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 pr-10 border border-slate-600 focus:border-yellow-400 focus:outline-none"
                        placeholder="Nhập mật khẩu mới"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4 text-slate-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 pr-10 border border-slate-600 focus:border-yellow-400 focus:outline-none"
                        placeholder="Nhập lại mật khẩu mới"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4 text-slate-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={isUpdatingPassword}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isUpdatingPassword ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Actions */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Tài khoản</h3>
              <div className="space-y-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5" />
                <span>Khu vực nguy hiểm</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-red-300 text-sm mb-3">
                    Xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu của bạn. Hành động này không thể hoàn tác.
                  </p>
                  
                  {!isDeletingAccount ? (
                    <button
                      onClick={() => setIsDeletingAccount(true)}
                      className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Xóa tài khoản</span>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type={showDeletePassword ? 'text' : 'password'}
                          value={deleteConfirmPassword}
                          onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                          className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 pr-10 border border-red-500 focus:outline-none"
                          placeholder="Nhập mật khẩu để xác nhận"
                        />
                        <button
                          type="button"
                          onClick={() => setShowDeletePassword(!showDeletePassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showDeletePassword ? (
                            <EyeOff className="w-4 h-4 text-slate-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={handleDeleteAccount}
                          disabled={isDeleting}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
                        </button>
                        <button
                          onClick={() => {
                            setIsDeletingAccount(false);
                            setDeleteConfirmPassword('');
                          }}
                          className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 