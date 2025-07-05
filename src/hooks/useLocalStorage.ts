import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Nếu valueToStore là array và chứa objects với số thập phân, làm tròn chúng
      let processedValue = valueToStore;
      if (Array.isArray(valueToStore)) {
        processedValue = valueToStore.map((item: any) => {
          if (typeof item === 'object' && item !== null) {
            const processedItem = { ...item };
            // Làm tròn các trường số thập phân trong transaction
            if (typeof processedItem.buyPrice === 'number') {
              processedItem.buyPrice = Math.round(processedItem.buyPrice * 1000000) / 1000000;
            }
            if (typeof processedItem.sellPrice === 'number') {
              processedItem.sellPrice = Math.round(processedItem.sellPrice * 1000000) / 1000000;
            }
            if (typeof processedItem.buyQuantity === 'number') {
              processedItem.buyQuantity = Math.round(processedItem.buyQuantity * 1000000) / 1000000;
            }
            if (typeof processedItem.sellQuantity === 'number') {
              processedItem.sellQuantity = Math.round(processedItem.sellQuantity * 1000000) / 1000000;
            }
            return processedItem;
          }
          return item;
        }) as T;
      }
      
      setStoredValue(processedValue);
      window.localStorage.setItem(key, JSON.stringify(processedValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
} 