import { db } from '../config/firebase';
import { CompletedTransaction } from '../types';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';

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

/**
 * Save a completed transaction to Firestore under the user's collection
 * @param completedTransaction CompletedTransaction object
 * @param userId string
 */
export async function saveCompletedTransactionToFirestore(completedTransaction: CompletedTransaction, userId: string) {
  if (!userId) throw new Error('Missing userId');
  const docId = completedTransaction.id || Date.now().toString();
  const ref = doc(collection(db, 'users', userId, 'completedTransactions'), docId);
  await setDoc(ref, removeUndefined(completedTransaction));
}

/**
 * Share statistics for a specific date to public collection
 * @param transactions CompletedTransaction[] for the date
 * @param shareDate string (YYYY-MM-DD)
 * @param userId string
 * @param displayName string
 */
export async function shareStatisticsToFirestore(
  transactions: CompletedTransaction[], 
  shareDate: string, 
  userId: string, 
  displayName: string
) {
  if (!userId || !transactions.length) throw new Error('Missing userId or transactions');
  
  // Calculate summary statistics
  const profits = transactions.map(t => t.profit);
  const totalProfit = profits.reduce((sum, profit) => sum + profit, 0);
  const profitableTransactions = profits.filter(p => p > 0).length;
  const lossTransactions = profits.filter(p => p < 0).length;
  const averageProfit = totalProfit / transactions.length;
  
  const shareData = {
    userId,
    displayName,
    shareDate,
    createdAt: new Date().toISOString(),
    transactions: removeUndefined(transactions),
    summary: {
      totalProfit,
      totalTransactions: transactions.length,
      profitableTransactions,
      lossTransactions,
      averageProfit,
    }
  };
  
  // Add to shared_statistics collection with auto-generated ID
  const docRef = await addDoc(collection(db, 'shared_statistics'), removeUndefined(shareData));
  return docRef.id;
} 