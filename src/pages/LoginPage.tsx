import React, { useState } from 'react';
import { Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy returnUrl từ state hoặc mặc định là trang chủ
  const returnUrl = (location.state as any)?.returnUrl || '/';

  // Nếu đã đăng nhập, chuyển hướng về returnUrl hoặc trang chủ
  if (currentUser) {
    return <Navigate to={returnUrl} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signIn(email, password);
      showSuccessToast('Đăng nhập thành công!');
      navigate(returnUrl);
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Đăng nhập thất bại';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Email không tồn tại';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Mật khẩu không đúng';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email không hợp lệ';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau';
      }
      
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Back to Home Button */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-slate-400 hover:text-yellow-400 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm">Quay lại trang chủ</span>
          </Link>
        </div>
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            POE Trading Calculator
          </h2>
          <p className="text-slate-400">Đăng nhập vào tài khoản của bạn</p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Nhập email của bạn"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-slate-600 rounded-lg bg-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Nhập mật khẩu của bạn"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Đang đăng nhập...</span>
                </div>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Quên mật khẩu?
            </Link>
            <div className="text-slate-400 text-sm">
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
              >
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 