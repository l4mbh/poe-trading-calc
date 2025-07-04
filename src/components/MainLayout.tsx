import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

const MainLayout: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const isHome = location.pathname === "/";
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <Header
        searchTerm={isHome ? searchTerm : undefined}
        onSearchChange={isHome ? setSearchTerm : undefined}
      />
      <main className="flex-1">
        <Outlet context={{ searchTerm, setSearchTerm }} />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout; 