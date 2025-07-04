import React from 'react';
import { Coins } from 'lucide-react';

interface HeaderProps {
  // Simplified props - no longer need exchange rate and profit props
}

export function Header({}: HeaderProps) {
  // Header component is now simplified - no local state needed

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
              <Coins className="w-6 h-6 text-slate-900" />
            </div>
            <h1 className="text-2xl font-bold text-white">POE Trading Calculator</h1>
          </div>
        </div>
      </div>
    </div>
  );
} 