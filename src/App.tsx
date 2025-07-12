import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SharesPage from "./pages/SharesPage";
import UpdatesPage from "./pages/UpdatesPage";
import StatisticsPage from "./pages/StatisticsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import MainLayout from "./components/MainLayout";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute } from "./components/PrivateRoute";
import FunMembersPage from './pages/FunMembersPage';
import DivinePricePage from "./pages/DivinePricePage";

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/members" element={<FunMembersPage />} />
          
          {/* Main Layout with Mixed Routes */}
          <Route path="/" element={<MainLayout />}>
            {/* Public Routes */}
            <Route index element={<HomePage />} />
            <Route path="updates" element={<UpdatesPage />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="shares" element={<SharesPage />} />
            <Route path="divine-price" element={<DivinePricePage />} />
            
            {/* Protected Routes */}
            <Route path="profile" element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } />
          </Route>
        </Routes>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
