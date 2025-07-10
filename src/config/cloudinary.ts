// Cloudinary configuration for client-side upload
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your_cloud_name',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'poe_trading_preset',
};

interface CloudinaryOptions {
  width?: number | string;
  height?: number | string;
  crop?: string;
  quality?: string | number;
}

// Helper functions for Cloudinary operations
export const uploadImage = async (file: File, folder: string = 'poe-trading-avatars'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', folder);

    fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.secure_url) {
          resolve(data.secure_url);
        } else {
          reject(new Error('Upload failed: No URL returned'));
        }
      })
      .catch(error => {
        console.error('Upload error:', error);
        reject(error);
      });
  });
};

export const deleteImage = async (): Promise<void> => {
  try {
    // For client-side deletion, we need to use a different approach
    // Since we can't use the server-side SDK, we'll need to implement
    // this through a backend API or use Cloudinary's client-side deletion
    console.warn('Client-side deletion not implemented. Please implement server-side deletion API.');
    throw new Error('Client-side deletion not supported');
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export const getImageUrl = (publicId: string, options: CloudinaryOptions = {}): string => {
  // Build Cloudinary URL manually
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
  const transformations = options.width || options.height ? 
    `w_${options.width || 'auto'},h_${options.height || 'auto'},c_${options.crop || 'fill'},q_${options.quality || 'auto'}` : '';
  
  return `${baseUrl}/${transformations ? transformations + '/' : ''}${publicId}`;
};

// Extract public ID from Cloudinary URL
export const extractPublicId = (url: string): string => {
  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    if (uploadIndex !== -1 && uploadIndex + 1 < urlParts.length) {
      // Remove file extension
      const publicIdWithExt = urlParts.slice(uploadIndex + 1).join('/');
      return publicIdWithExt.split('.')[0];
    }
    throw new Error('Invalid Cloudinary URL');
  } catch (error) {
    console.error('Error extracting public ID:', error);
    throw error;
  }
}; 