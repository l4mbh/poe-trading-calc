import { STORAGE_KEYS } from "./constants";

const getDivineToChaoRate = (): number => {
  const stored = localStorage.getItem(STORAGE_KEYS.EXCHANGE_RATE);
  return stored ? parseFloat(stored) : 180;
};

export const chaosToDiv = (chaosAmount: number) => {
  const divineToChaoRate = getDivineToChaoRate();
  return chaosAmount / divineToChaoRate;
};

export const divToChaos = (divAmount: number) => {
  const divineToChaoRate = getDivineToChaoRate();
  return divAmount * divineToChaoRate;
};

export const convertPrice = (
  price: number, 
  fromCurrency: 'chaos' | 'divine', 
  toCurrency: 'chaos' | 'divine'
) => {
  if (fromCurrency === toCurrency) return price;
  const divineToChaoRate = getDivineToChaoRate();
  if (fromCurrency === 'chaos' && toCurrency === 'divine') return chaosToDiv(price);
  if (fromCurrency === 'divine' && toCurrency === 'chaos') return divToChaos(price);
  return price;
};

export const getPriceInChaos = (price: number, currency: 'chaos' | 'divine') => {
  return currency === 'chaos' ? price : divToChaos(price);
};

export const formatTime = (date: Date | string) => {
  const d = (date instanceof Date) ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
}; 