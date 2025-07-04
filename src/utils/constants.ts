export const STORAGE_KEYS = {
  TRANSACTIONS: 'poe-trading-transactions',
  GROUPS: 'poe-trading-groups',
  COMPLETED_TRANSACTIONS: 'poe-completed-transactions',
  EXCHANGE_RATE: 'poe-divine-chaos-rate',
  LAST_UPDATED: 'poe-rate-last-updated',
  SELECTED_LEAGUE: 'poe-selected-league',
  API_RATE: 'poe-api-rate',
  API_LAST_UPDATED: 'poe-api-last-updated',
  PROFIT_FILTER: 'poe-profit-filter',
  TOTAL_PROFIT_CURRENCY: 'poe-total-profit-currency',
  SELL_PRICE_MODE: 'poe-sell-price-mode',
  PROFIT_DISPLAY_CURRENCY: 'poe-profit-display-currency',
  ENABLE_API_CALLS: 'poe-enable-api-calls'
} as const;

export const GROUP_COLORS = [
  'bg-blue-500/20 border-blue-500/30 text-blue-400',
  'bg-green-500/20 border-green-500/30 text-green-400',
  'bg-purple-500/20 border-purple-500/30 text-purple-400',
  'bg-pink-500/20 border-pink-500/30 text-pink-400',
  'bg-orange-500/20 border-orange-500/30 text-orange-400',
  'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
] as const;

export const CURRENCY_IMAGES = {
  chaos: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lSZXJvbGxSYXJlIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/d119a0d734/CurrencyRerollRare.png',
  divine: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lNb2RWYWx1ZXMiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/e1a54ff97d/CurrencyModValues.png'
} as const;

export const POE_LEAGUES = [
  'Mercenaries',
  'Settlers',
  'Crucible',
  'Sanctum',
  'Kalandra',
  'Sentinel',
  'Archnemesis',
  'Scourge',
  'Expedition',
  'Ultimatum',
  'Standard',
  'Hardcore'
] as const; 