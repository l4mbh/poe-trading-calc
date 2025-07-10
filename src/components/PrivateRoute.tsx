import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-slate-400 mt-4">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập, chuyển hướng về login với returnUrl để quay lại trang hiện tại
  return currentUser ? (
    <>{children}</>
  ) : (
    <Navigate 
      to="/login" 
      state={{ returnUrl: location.pathname }}
      replace 
    />
  );
}; 