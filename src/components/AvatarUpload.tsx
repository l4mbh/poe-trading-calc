import React, { useState, useRef } from 'react';
import { User, Upload, X, Loader2 } from 'lucide-react';
import { uploadImage } from '../config/cloudinary';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  userId: string;
  onAvatarChange: (avatarUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showUploadButton?: boolean;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  userId,
  onAvatarChange,
  size = 'md',
  className = '',
  showUploadButton = true,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const buttonSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh hợp lệ');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File ảnh không được lớn hơn 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const avatarUrl = await uploadImage(file, `poe-trading-avatars/${userId}`);
      onAvatarChange(avatarUrl);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentAvatarUrl) return;

    setIsDeleting(true);
    try {
      // For now, we'll just clear the avatar URL
      // In a real implementation, you'd want to implement server-side deletion
      onAvatarChange('');
      console.log('Avatar deleted (URL cleared). For complete deletion, implement server-side API.');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Có lỗi xảy ra khi xóa ảnh. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className={`flex flex-col items-center space-y-3 ${className}`}>
      {/* Avatar Display */}
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-full bg-slate-600 flex items-center justify-center overflow-hidden border-2 border-slate-500`}>
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className={`${iconSizes[size]} text-slate-400`} />
          )}
        </div>

        {/* Upload/Delete Overlay */}
        {showUploadButton && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            {isUploading || isDeleting ? (
              <Loader2 className={`${buttonSizes[size]} text-white animate-spin`} />
            ) : displayUrl ? (
              <button
                onClick={handleDelete}
                className="p-1 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                title="Xóa ảnh"
              >
                <X className={`${buttonSizes[size]} text-white`} />
              </button>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors"
                title="Tải ảnh lên"
              >
                <Upload className={`${buttonSizes[size]} text-white`} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview Actions */}
      {previewUrl && (
        <div className="flex space-x-2">
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white text-sm rounded-lg transition-colors flex items-center space-x-1"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang tải...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Lưu</span>
              </>
            )}
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 bg-slate-500 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
          >
            Hủy
          </button>
        </div>
      )}

      {/* Upload Button (when no preview) */}
      {!previewUrl && showUploadButton && !currentAvatarUrl && (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white text-sm rounded-lg transition-colors flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Tải ảnh lên</span>
        </button>
      )}
    </div>
  );
};

export { AvatarUpload }; 