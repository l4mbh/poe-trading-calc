import React, { useState } from 'react';
import { Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signUp, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy returnUrl từ state hoặc mặc định là trang chủ
  const returnUrl = (location.state as any)?.returnUrl || '/';

  // Nếu đã đăng nhập, chuyển hướng về returnUrl hoặc trang chủ
  if (currentUser) {
    return <Navigate to={returnUrl} />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signUp(formData.email, formData.password, formData.displayName);
      showSuccessToast('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
      navigate(returnUrl);
    } catch (error: any) {
      console.error('Register error:', error);
      
      let errorMessage = 'Đăng ký thất bại';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email đã được sử dụng';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email không hợp lệ';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Mật khẩu quá yếu';
      }
      
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const { password } = formData;
    if (!password) return { strength: 0, color: 'text-slate-400', text: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const colors = ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-blue-400', 'text-green-400', 'text-green-500'];
    const texts = ['Rất yếu', 'Yếu', 'Trung bình', 'Khá', 'Mạnh', 'Rất mạnh'];
    
    return {
      strength: Math.min(strength, 5),
      color: colors[Math.min(strength, 5)],
      text: texts[Math.min(strength, 5)]
    };
  };

  const passwordStrength = getPasswordStrength();

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
          <p className="text-slate-400">Tạo tài khoản mới</p>
        </div>

        {/* Register Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {/* Display Name Field */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-slate-300 mb-2">
                Tên hiển thị (tùy chọn)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  autoComplete="name"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Nhập tên hiển thị"
                />
              </div>
            </div>

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
                  value={formData.email}
                  onChange={handleInputChange}
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-12 py-3 border border-slate-600 rounded-lg bg-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Nhập mật khẩu"
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
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.strength === 0 ? 'bg-slate-600' :
                          passwordStrength.strength === 1 ? 'bg-red-400' :
                          passwordStrength.strength === 2 ? 'bg-orange-400' :
                          passwordStrength.strength === 3 ? 'bg-yellow-400' :
                          passwordStrength.strength === 4 ? 'bg-blue-400' :
                          'bg-green-400'
                        }`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs ${passwordStrength.color}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg bg-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-500'
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? 'border-green-500'
                      : 'border-slate-600'
                  }`}
                  placeholder="Nhập lại mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-300" />
                  )}
                </button>
                {formData.confirmPassword && (
                  <div className="absolute inset-y-0 right-12 flex items-center">
                    {formData.password === formData.confirmPassword ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                )}
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
                  <span>Đang đăng ký...</span>
                </div>
              ) : (
                'Đăng ký'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <div className="text-slate-400 text-sm">
              Đã có tài khoản?{' '}
              <Link
                to="/login"
                className="text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 