import React from 'react';
import { Coins, Search } from 'lucide-react';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function Header({ searchTerm, onSearchChange }: HeaderProps) {
  return (
    <div className="w-full bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-30">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand - Left Side */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
              <Coins className="w-6 h-6 text-slate-900" />
            </div>
            <h1 className="text-2xl font-bold text-white">POE Trading Calculator</h1>
          </div>

          {/* Search Bar - Right Side */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm giao dịch..."
              className="w-full bg-slate-700/50 text-white rounded-lg pl-10 pr-4 py-2 border border-slate-600 focus:border-yellow-400 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 