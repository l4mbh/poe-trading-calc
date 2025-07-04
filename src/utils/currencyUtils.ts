export const chaosToDiv = (chaosAmount: number, divineToChaoRate: number) => {
  return chaosAmount / divineToChaoRate;
};

export const divToChaos = (divAmount: number, divineToChaoRate: number) => {
  return divAmount * divineToChaoRate;
};

export const convertPrice = (
  price: number, 
  fromCurrency: 'chaos' | 'divine', 
  toCurrency: 'chaos' | 'divine',
  divineToChaoRate: number
) => {
  if (fromCurrency === toCurrency) return price;
  if (fromCurrency === 'chaos' && toCurrency === 'divine') return chaosToDiv(price, divineToChaoRate);
  if (fromCurrency === 'divine' && toCurrency === 'chaos') return divToChaos(price, divineToChaoRate);
  return price;
};

export const getPriceInChaos = (price: number, currency: 'chaos' | 'divine', divineToChaoRate: number) => {
  return currency === 'chaos' ? price : divToChaos(price, divineToChaoRate);
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