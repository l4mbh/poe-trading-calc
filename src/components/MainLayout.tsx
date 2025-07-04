import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";

const MainLayout: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const isHome = location.pathname === "/";
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header
        searchTerm={isHome ? searchTerm : undefined}
        onSearchChange={isHome ? setSearchTerm : undefined}
      />
      <Outlet context={{ searchTerm, setSearchTerm }} />
    </div>
  );
};

export default MainLayout; 