import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AnnouncementBarProps {
  message: React.ReactNode;
  className?: string;
}

const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ message, className }) => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className={`w-full bg-yellow-400/10 border-b border-yellow-400/20 text-yellow-300 text-center py-2 text-sm font-medium relative ${className || ''}`}>
      <span>{message}</span>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-400 hover:text-yellow-600"
        onClick={() => setVisible(false)}
        aria-label="Đóng thông báo"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default AnnouncementBar; 