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
 * Lấy tỷ giá Divine Orb từ POE.ninja API qua Vite proxy
 */
export const fetchDivineToChaoRate = async (league: string): Promise<number> => {
  const formattedLeague = formatLeagueName(league);
  
  try {
    // Sử dụng Vite proxy thay vì gọi trực tiếp
    const proxyUrl = `/poe-ninja-api/data/currencyoverview?league=${encodeURIComponent(formattedLeague)}&type=Currency`;
    console.log('Fetching via Vite proxy:', proxyUrl);
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API response received for league:', formattedLeague);
    
    // Sử dụng helper function để extract rate
    const rate = extractDivineRate(data);
    console.log('Divine to Chaos rate found:', rate);
    
    return rate;
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Lỗi không xác định';
    console.error('Vite proxy API call failed:', error);
    
    // Kiểm tra các loại lỗi phổ biến
    if (errorMsg.includes('timeout') || errorMsg.includes('AbortError')) {
      throw new Error(`Timeout khi gọi API cho league "${formattedLeague}". Vui lòng thử lại.`);
    }
    
    if (errorMsg.includes('fetch') || errorMsg.includes('NetworkError') || errorMsg.includes('Failed to fetch')) {
      throw new Error(`Không thể kết nối đến POE.ninja API. Kiểm tra kết nối mạng hoặc dev server có đang chạy.`);
    }
    
    if (errorMsg.includes('404')) {
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