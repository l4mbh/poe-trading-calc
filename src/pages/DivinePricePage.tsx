import React, { useEffect, useState } from "react";
// @ts-expect-error - papaparse doesn't have TypeScript types
import Papa from "papaparse";
import { useAuth } from "../contexts/AuthContext";
import { RefreshCw, Facebook, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { showInfoToast, showSuccessToast, showErrorToast } from "../utils/toastUtils";
import DivineOrbImage from "../assets/images/Divine_Orb.png";
import MirrorImage from "../assets/images/Mirror_of_Kalandra.png";
import { db, auth } from "../config/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// Helper function to remove undefined values (theo pattern của dự án)
function removeUndefined<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined) as T;
  }
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter((entry) => entry[1] !== undefined)
        .map(([k, v]) => [k, removeUndefined(v)])
    ) as T;
  }
  return obj;
}

interface PriceData {
  divine: string;
  mirror: string;
  updatedAt: string;
  facebookLink?: string;
}

interface FirestorePriceData extends PriceData {
  lastFetchAt: Date | { seconds: number; nanoseconds: number }; // Firestore timestamp
  previousDivine?: string;
  previousMirror?: string;
  traderName: string; // Thêm tên trader để dễ quản lý
}

interface Trader {
  name: string;
  sheetId: string;
  gid: string;
  parser: (rows: string[][]) => PriceData | null;
}

// Cache expiry time: 5 minutes
// Cache expiry time (4 minutes - matching Firestore rules)
const CACHE_EXPIRY_MS = 4 * 60 * 1000;

// Get Firestore document ID for trader (theo pattern của dự án)
const getTraderDocId = (trader: Trader) => trader.name.replace(/\s+/g, '-').toLowerCase();

// Get localStorage key for fetch timing
const getFetchTimingKey = (trader: Trader) => `divine-fetch-timing-${trader.name}`;

// Check if we should fetch new data (based on timing cache)
const shouldFetchNewData = (trader: Trader, forceRefresh: boolean = false): boolean => {
  if (forceRefresh) return true;
  
  try {
    const lastFetchTime = localStorage.getItem(getFetchTimingKey(trader));
    if (!lastFetchTime) return true;
    
    const timeSinceLastFetch = Date.now() - parseInt(lastFetchTime);
    return timeSinceLastFetch > CACHE_EXPIRY_MS;
  } catch {
    return true;
  }
};

// Update fetch timing in localStorage
const updateFetchTiming = (trader: Trader): void => {
  try {
    localStorage.setItem(getFetchTimingKey(trader), Date.now().toString());
  } catch (error) {
    console.error('Failed to update fetch timing:', error);
  }
};

// Get cached timing info for display
const getFetchTimingInfo = (trader: Trader): { isRecent: boolean; minutesLeft: number } => {
  try {
    const lastFetchTime = localStorage.getItem(getFetchTimingKey(trader));
    if (!lastFetchTime) return { isRecent: false, minutesLeft: 0 };
    
    const timeSinceLastFetch = Date.now() - parseInt(lastFetchTime);
    const timeLeft = Math.max(0, CACHE_EXPIRY_MS - timeSinceLastFetch);
    const minutesLeft = Math.ceil(timeLeft / 60000);
    
    return {
      isRecent: timeSinceLastFetch < CACHE_EXPIRY_MS,
      minutesLeft
    };
  } catch {
    return { isRecent: false, minutesLeft: 0 };
  }
};

// Compare prices and determine trend
const getPriceTrend = (current: string, previous?: string): 'up' | 'down' | 'same' | null => {
  if (!previous) return null;
  
  const currentNum = parseFloat(current.replace(/[,₫]/g, ''));
  const previousNum = parseFloat(previous.replace(/[,₫]/g, ''));
  
  if (isNaN(currentNum) || isNaN(previousNum)) return null;
  
  if (currentNum > previousNum) return 'up';
  if (currentNum < previousNum) return 'down';
  return 'same';
};

// Load price data from Firestore (theo pattern collection divine_prices)
const loadPriceFromFirestore = async (trader: Trader): Promise<FirestorePriceData | null> => {
  try {
    const docRef = doc(db, 'divine_prices', getTraderDocId(trader));
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as FirestorePriceData;
      return data;
    }
    return null;
  } catch (error) {
    console.error('Failed to load price from Firestore:', error);
    return null;
  }
};

// Save price data to Firestore (theo pattern của dự án với removeUndefined)
const savePriceToFirestore = async (trader: Trader, priceData: PriceData, previousData?: FirestorePriceData): Promise<void> => {
  const docRef = doc(db, 'divine_prices', getTraderDocId(trader));
  
  // Debug authentication state
  console.log('🔐 Saving to Firestore with auth state:', {
    hasAuth: !!auth.currentUser,
    uid: auth.currentUser?.uid,
    email: auth.currentUser?.email,
    docId: getTraderDocId(trader),
    timestamp: new Date().toISOString()
  });
  
  try {
    const firestoreData = {
      ...priceData,
      traderName: trader.name,
      lastFetchAt: serverTimestamp(),
      previousDivine: previousData?.divine,
      previousMirror: previousData?.mirror,
    };
    
    // Remove undefined values theo pattern của dự án
    const cleanData = removeUndefined(firestoreData);
    
    await setDoc(docRef, cleanData);
    
    // Update local fetch timing
    updateFetchTiming(trader);
    console.log(`✅ Successfully saved price data for ${trader.name}`);
    showSuccessToast(`Đã cập nhật giá từ ${trader.name}`);
  } catch (error: unknown) {
    console.error('Failed to save price to Firestore:', error);
    showErrorToast('Không thể lưu dữ liệu giá');
    // Nếu là lỗi permission, thử các cách khác
    if (error && typeof error === 'object' && 'code' in error && error.code === 'permission-denied') {
      try {
        console.log(`🔄 Retrying with merge for ${trader.name}...`);
        const cleanData = removeUndefined({
          ...priceData,
          traderName: trader.name,
          lastFetchAt: serverTimestamp(),
          previousDivine: previousData?.divine,
          previousMirror: previousData?.mirror,
        });
        await setDoc(docRef, cleanData, { merge: true });
        updateFetchTiming(trader);
        console.log(`✅ Successfully saved with merge for ${trader.name}`);
      } catch (retryError) {
        console.error('Retry with merge failed:', retryError);
        

        
        throw retryError;
      }
    } else {
      throw error;
    }
  }
};

// Parser cho Thịnh Phạm
const parseThinhPhamData = (rows: string[][]): PriceData | null => {
  const formatPrice = (price: string) => {
    return price.replace("₫", "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  let divineIndex = -1;
  let mirrorIndex = -1;
  let facebookLink: string | undefined;

  // Tìm dòng tiêu đề chứa "Divine Orb", "Mirror of Kalandra" và link Facebook
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Tìm link Facebook
    for (let j = 0; j < row.length; j++) {
      if (row[j]?.toLowerCase().includes("facebook.com")) {
        facebookLink = row[j].match(/https:\/\/www\.facebook\.com\/[^\s]+/)?.[0];
      }
      if (row[j]?.toLowerCase().includes("divine orb")) {
        divineIndex = j;
      }
      if (row[j]?.toLowerCase().includes("mirror of kalandra")) {
        mirrorIndex = j;
      }
    }

    // Lấy giá trị từ dòng tiếp theo nếu tìm thấy tiêu đề Divine/Mirror
    if (divineIndex !== -1 && mirrorIndex !== -1) {
      const valueRow = rows[i + 1];
      if (valueRow && valueRow[divineIndex] && valueRow[mirrorIndex]) {
        return {
          divine: formatPrice(valueRow[divineIndex] || "-"),
          mirror: formatPrice(valueRow[mirrorIndex] || "-"),
          updatedAt: new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
          facebookLink,
        };
      }
    }
  }
  return null;
};

const TRADERS: Trader[] = [
  {
    name: "Thịnh Phạm",
    sheetId: "1NXkUmJEmu5LI2l8kiCttmEoQ17kZZ75SOUFlRd79Ycw",
    gid: "0",
    parser: parseThinhPhamData,
  },
];

function useDivinePrice(trader: Trader, refreshTrigger: number) {
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState<FirestorePriceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Load initial data from Firestore
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const firestoreData = await loadPriceFromFirestore(trader);
        if (firestoreData) {
          setPrice(firestoreData);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [trader]);

  // Fetch new data when needed
  useEffect(() => {
    const fetchNewData = async () => {
      const forceRefresh = refreshTrigger > 0;
      
      // Chỉ fetch khi user đã đăng nhập
      if (!currentUser) {
        console.log('⏳ User not authenticated, skipping fetch');
        return;
      }
      
      if (!shouldFetchNewData(trader, forceRefresh)) {
        return; // Skip fetch if not needed
      }

      setLoading(true);
      setError(null);
      
      const CSV_URL = `https://docs.google.com/spreadsheets/d/${trader.sheetId}/export?format=csv&id=${trader.sheetId}&gid=${trader.gid}`;
      
      try {
        const response = await fetch(CSV_URL);
        if (!response.ok) throw new Error("Không thể fetch dữ liệu từ Google Sheet.");
        
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          complete: async (results: { data: string[][] }) => {
            try {
              const rows = results.data;
              const parsedData = trader.parser(rows);
              
              if (parsedData) {
                // Get previous data for comparison (luôn cố gắng lấy)
                const previousData = await loadPriceFromFirestore(trader);
                
                // Save to Firestore chỉ khi user đã đăng nhập
                if (currentUser) {
                  try {
                    await savePriceToFirestore(trader, parsedData, previousData || undefined);
                    console.log('✅ Saved to Firestore for comparison');
                  } catch (error) {
                    console.error('❌ Failed to save to Firestore:', error);
                    showErrorToast('Không thể lưu dữ liệu so sánh');
                    // Không throw error, vẫn hiển thị dữ liệu
                  }
                } else {
                  console.log('⏳ User not authenticated, skipping Firestore save');
                  showInfoToast('Đăng nhập để lưu lịch sử so sánh giá');
                }
                
                // Create updated data with comparison (luôn hiển thị)
                const updatedData: FirestorePriceData = {
                  ...parsedData,
                  traderName: trader.name,
                  lastFetchAt: new Date(),
                  previousDivine: previousData?.divine,
                  previousMirror: previousData?.mirror,
                };
                
                setPrice(updatedData);
              } else {
                setError("Không tìm thấy dữ liệu giá Divine/Mirror.");
              }
            } catch (err) {
              console.error('Parse error:', err);
              setError("Lỗi xử lý dữ liệu.");
            }
            setLoading(false);
          },
          error: () => {
            setError("Lỗi đọc file CSV.");
            setLoading(false);
          },
        });
      } catch (err) {
        console.error('Fetch error:', err);
        setError("Không thể fetch dữ liệu từ Google Sheet.");
        setLoading(false);
      }
    };

    fetchNewData();
  }, [trader, refreshTrigger, currentUser]);

  return { loading, price, error };
}

function TraderCard({ trader }: { trader: Trader }) {
  const { currentUser } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { loading, price, error } = useDivinePrice(trader, refreshTrigger);

  const handleRefresh = () => {
    // Kiểm tra xem có thể refresh không (theo timing cache)
    if (isRecent && !loading) {
      console.log(`⏳ Cannot refresh yet, ${minutesLeft} minutes left`);
      showInfoToast(`Vui lòng chờ ${minutesLeft} phút để refresh lại`);
      return;
    }
    
    console.log('🔄 Refreshing data...', currentUser ? `(User: ${currentUser.uid})` : '(Guest)');
    setRefreshTrigger((prev) => prev + 1);
  };

  // Get price trends
  const divineTrend = price ? getPriceTrend(price.divine, price.previousDivine) : null;
  const mirrorTrend = price ? getPriceTrend(price.mirror, price.previousMirror) : null;
  
  // Debug price comparison
  if (price && (price.previousDivine || price.previousMirror)) {
    console.log('💰 Price comparison for', trader.name, {
      divine: { current: price.divine, previous: price.previousDivine, trend: divineTrend },
      mirror: { current: price.mirror, previous: price.previousMirror, trend: mirrorTrend }
    });
  }

  // Get fetch timing info
  const { isRecent, minutesLeft } = getFetchTimingInfo(trader);

  const renderTrendIcon = (trend: 'up' | 'down' | 'same' | null) => {
    if (!trend) return null;
    
    if (trend === 'same') {
      return (
        <div className="w-4 h-4 text-slate-400" title="Giá không thay đổi">
          <div className="w-4 h-4 flex items-center justify-center">
            <div className="w-3 h-0.5 bg-slate-400 rounded"></div>
          </div>
        </div>
      );
    }
    
    return trend === 'up' ? (
      <div className="w-4 h-4 text-green-400" title="Giá tăng so với lần trước">
        <TrendingUp className="w-4 h-4" />
      </div>
    ) : (
      <div className="w-4 h-4 text-red-400" title="Giá giảm so với lần trước">
        <TrendingDown className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">{trader.name.charAt(0)}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{trader.name}</h3>
            <div className="flex items-center space-x-2">
              <p className="text-xs text-slate-400">Trader</p>
              {isRecent && (
                <span className="text-xs text-blue-400 flex items-center space-x-1" title={`Cache còn ${minutesLeft} phút`}>
                  <Clock className="w-3 h-3" />
                  <span>{minutesLeft}p</span>
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Contact Icon */}
          {price?.facebookLink && currentUser && (
            <a
              href={price.facebookLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-blue-400 transition-colors"
              title="Liên hệ Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
          )}
          
          {/* Refresh Button - chỉ hiển thị khi đã đăng nhập */}
          {currentUser && (
            <button
              onClick={handleRefresh}
              disabled={loading || isRecent}
              className={`p-2 rounded-lg transition-colors ${
                loading || isRecent 
                  ? "opacity-50 cursor-not-allowed text-slate-500" 
                  : "hover:bg-slate-700/50 text-slate-400 hover:text-yellow-400"
              }`}
              title={
                loading 
                  ? "Đang tải dữ liệu..." 
                  : isRecent 
                    ? `Vui lòng chờ ${minutesLeft} phút để refresh lại` 
                    : "Làm mới dữ liệu"
              }
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {!currentUser ? (
        <div className="text-center py-8">
          <div className="text-slate-400 text-sm mb-2">🔒</div>
          <div className="text-slate-400 text-sm mb-3">Đăng nhập để xem giá</div>
          <div className="space-y-3">
            {/* Divine Orb Placeholder */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4 opacity-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={DivineOrbImage}
                    alt="Divine Orb"
                    className="w-8 h-8"
                  />
                  <div>
                    <div className="text-white font-medium">Divine Orb</div>
                    <div className="text-xs text-slate-400">Thiêng liêng</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-slate-500">***</div>
                  <div className="text-xs text-slate-400">VNĐ</div>
                </div>
              </div>
            </div>

            {/* Mirror of Kalandra Placeholder */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4 opacity-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={MirrorImage}
                    alt="Mirror of Kalandra"
                    className="w-8 h-8"
                  />
                  <div>
                    <div className="text-white font-medium">Mirror of Kalandra</div>
                    <div className="text-xs text-slate-400">Gương phản chiếu</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-slate-500">***</div>
                  <div className="text-xs text-slate-400">VNĐ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="h-6 bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-1/2"></div>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="h-6 bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-400 text-sm mb-2">⚠️</div>
              <div className="text-red-400 text-sm">{error}</div>
            </div>
          )}

          {price && !error && (
            <div className="space-y-4">
              {/* Divine Orb Price */}
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={DivineOrbImage}
                      alt="Divine Orb"
                      className="w-8 h-8"
                    />
                    <div>
                      <div className="text-white font-medium">Divine Orb</div>
                      <div className="text-xs text-slate-400">Thiêng liêng</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <div className="text-xl font-bold text-yellow-400">{price.divine}</div>
                      {renderTrendIcon(divineTrend)}
                    </div>
                    <div className="text-xs text-slate-400">VNĐ</div>
                    {price.previousDivine && (
                      <div className="text-xs text-slate-500 mt-1">
                        Trước: {price.previousDivine}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mirror of Kalandra Price */}
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={MirrorImage}
                      alt="Mirror of Kalandra"
                      className="w-8 h-8"
                    />
                    <div>
                      <div className="text-white font-medium">Mirror of Kalandra</div>
                      <div className="text-xs text-slate-400">Gương phản chiếu</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <div className="text-xl font-bold text-purple-400">{price.mirror}</div>
                      {renderTrendIcon(mirrorTrend)}
                    </div>
                    <div className="text-xs text-slate-400">VNĐ</div>
                    {price.previousMirror && (
                      <div className="text-xs text-slate-500 mt-1">
                        Trước: {price.previousMirror}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Update Time */}
              <div className="pt-3 border-t border-slate-700/50">
                <div className="text-xs text-slate-500 text-center space-y-1">
                  <div>Cập nhật: {price.updatedAt}</div>
                  {price.lastFetchAt && (
                    <div>
                      Lần fetch cuối: {
                        price.lastFetchAt instanceof Date 
                          ? price.lastFetchAt.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
                          : new Date(price.lastFetchAt.seconds * 1000).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function DivinePricePage() {
  const { currentUser, loading: authLoading } = useAuth();
  
  // Debug authentication state
  console.log('🔐 DivinePricePage auth state:', {
    hasCurrentUser: !!currentUser,
    uid: currentUser?.uid,
    authLoading
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Check giá Divine</h1>
          <p className="text-slate-400 text-sm">Xem giá Divine Orb và Mirror of Kalandra từ các trader</p>
        </div>

        {!currentUser && (
          <div className="bg-yellow-100/10 border border-yellow-400/30 text-yellow-300 rounded-lg px-4 py-3 text-center text-sm mb-6">
            🔒 Vui lòng đăng nhập để xem giá Divine Orb và Mirror of Kalandra từ các trader.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TRADERS.map((trader) => (
            <TraderCard key={trader.name} trader={trader} />
          ))}
        </div>
      </div>
    </div>
  );
}