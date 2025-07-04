export interface PoeNinjaApiResponse {
  lines: {
    currencyTypeName: string;
    chaosEquivalent: number;
    detailsId: string;
  }[];
}

export interface ExchangeRateData {
  rate: number;
  lastUpdated: Date;
  source: 'api' | 'manual';
}

/**
 * Helper function để extract Divine Orb rate từ POE.ninja API response
 */
const extractDivineRate = (data: PoeNinjaApiResponse): number => {
  // Kiểm tra cấu trúc dữ liệu
  if (!data || !Array.isArray(data.lines)) {
    throw new Error('Invalid API response structure');
  }
  
  // Tìm Divine Orb trong danh sách
  const divineOrb = data.lines.find(item => 
    item.currencyTypeName === 'Divine Orb'
  );
  
  if (!divineOrb || typeof divineOrb.chaosEquivalent !== 'number') {
    throw new Error('Divine Orb not found in API response or invalid price data');
  }
  
  const rate = divineOrb.chaosEquivalent;
  
  // Kiểm tra tính hợp lý của tỷ giá (Divine thường từ 100-500 Chaos)
  if (rate < 50 || rate > 1000) {
    console.warn(`Unusual exchange rate detected: ${rate} Chaos per Divine`);
  }
  
  return Math.round(rate * 100) / 100; // Làm tròn 2 chữ số thập phân
};

/**
 * Phát hiện môi trường và trả về base URL phù hợp
 */
const getApiBaseUrl = (): string => {
  // Check if we're in development (Vite dev server)
  if (import.meta.env.DEV) {
    return '/poe-ninja-api/data';
  }
  
  // In production, use Vercel serverless function
  return '/api/poe-ninja';
};

/**
 * Lấy tỷ giá Divine Orb từ POE.ninja API
 * - Development: Sử dụng Vite proxy
 * - Production: Sử dụng Vercel serverless function
 */
export const fetchDivineToChaoRate = async (league: string): Promise<number> => {
  const formattedLeague = formatLeagueName(league);
  const apiBaseUrl = getApiBaseUrl();
  
  try {
    let apiUrl: string;
    
    if (import.meta.env.DEV) {
      // Development: Vite proxy format
      apiUrl = `${apiBaseUrl}/currencyoverview?league=${encodeURIComponent(formattedLeague)}&type=Currency`;
    } else {
      // Production: Vercel serverless function format
      apiUrl = `${apiBaseUrl}?league=${encodeURIComponent(formattedLeague)}&type=Currency`;
    }
    
    console.log(`Fetching via ${import.meta.env.DEV ? 'Vite proxy' : 'Vercel function'}:`, apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(15000) // 15 second timeout for production
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `${response.status} ${response.statusText}`;
      throw new Error(`API request failed: ${errorMessage}`);
    }
    
    const data = await response.json();
    console.log('API response received for league:', formattedLeague);
    
    // Sử dụng helper function để extract rate
    const rate = extractDivineRate(data);
    console.log('Divine to Chaos rate found:', rate);
    
    return rate;
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Lỗi không xác định';
    console.error('API call failed:', error);
    
    // Kiểm tra các loại lỗi phổ biến
    if (errorMsg.includes('timeout') || errorMsg.includes('AbortError')) {
      throw new Error(`Timeout khi gọi API cho league "${formattedLeague}". Vui lòng thử lại.`);
    }
    
    if (errorMsg.includes('fetch') || errorMsg.includes('NetworkError') || errorMsg.includes('Failed to fetch')) {
      const envHint = import.meta.env.DEV 
        ? 'Kiểm tra dev server có đang chạy không.' 
        : 'Kiểm tra kết nối mạng.';
      throw new Error(`Không thể kết nối đến API. ${envHint}`);
    }
    
    if (errorMsg.includes('404') || errorMsg.includes('League parameter is required')) {
      throw new Error(`League "${formattedLeague}" không tồn tại trên POE.ninja.`);
    }
    
    throw new Error(`Lỗi API: ${errorMsg}`);
  }
};

/**
 * Capitalize first letter of league name
 */
export const formatLeagueName = (league: string): string => {
  return league.charAt(0).toUpperCase() + league.slice(1).toLowerCase();
}; 