import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { describeFirestoreError } from '@/lib/firestoreErrors';

// Owned by the user via the document path — see firestore.rules.
const portfolioDocRef = (userId: string) => doc(db, 'users', userId, 'portfolio', 'current');

export interface Holding {
  symbol: string;
  shares: number;
  avgPrice: number;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  symbol: string;
  shares: number;
  price: number;
  total: number;
  timestamp: Date;
}

export interface Portfolio {
  userId: string;
  balance: number;
  holdings: Record<string, Holding>;
  transactions: Transaction[];
  totalValue: number;
  gainLoss: number;
  lastUpdated: Date;
}

// Initialize portfolio for new user
export const initializePortfolio = async (userId: string, initialBalance: number = 10000) => {
  try {
    const portfolioRef = portfolioDocRef(userId);
    
    await setDoc(portfolioRef, {
      userId,
      balance: initialBalance,
      holdings: {},
      transactions: [],
      totalValue: initialBalance,
      gainLoss: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error initializing portfolio:', error);
    return { success: false, error, message: describeFirestoreError(error) };
  }
};

// Get user portfolio
export const getPortfolio = async (userId: string) => {
  try {
    const portfolioRef = portfolioDocRef(userId);
    const portfolioDoc = await getDoc(portfolioRef);

    if (portfolioDoc.exists()) {
      return { success: true, data: portfolioDoc.data() as Portfolio };
    }
    
    // Initialize if doesn't exist
    await initializePortfolio(userId);
    const newDoc = await getDoc(portfolioRef);
    return { success: true, data: newDoc.data() as Portfolio };
  } catch (error) {
    console.error('Error getting portfolio:', error);
    return { success: false, error, message: describeFirestoreError(error) };
  }
};

// Save portfolio state
export const savePortfolio = async (
  userId: string,
  balance: number,
  holdings: Record<string, Holding>,
  totalValue: number,
  gainLoss: number
) => {
  try {
    const portfolioRef = portfolioDocRef(userId);
    
    await setDoc(portfolioRef, {
      balance,
      holdings,
      totalValue,
      gainLoss,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Error saving portfolio:', error);
    return { success: false, error, message: describeFirestoreError(error) };
  }
};

// Record a transaction
export const recordTransaction = async (
  userId: string,
  transaction: Omit<Transaction, 'id' | 'timestamp'>
) => {
  try {
    const portfolioRef = portfolioDocRef(userId);
    
    const transactionWithMetadata = {
      ...transaction,
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      timestamp: new Date(),
    };

    await setDoc(portfolioRef, {
      transactions: arrayUnion(transactionWithMetadata),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Error recording transaction:', error);
    return { success: false, error, message: describeFirestoreError(error) };
  }
};

// Buy stock
export const buyStock = async (
  userId: string,
  symbol: string,
  shares: number,
  price: number,
  currentBalance: number,
  currentHoldings: Record<string, Holding>
) => {
  try {
    const total = shares * price;
    
    if (total > currentBalance) {
      return { success: false, error: 'Insufficient balance' };
    }

    const newBalance = currentBalance - total;
    const existingHolding = currentHoldings[symbol];
    
    let newHoldings = { ...currentHoldings };
    if (existingHolding) {
      const totalShares = existingHolding.shares + shares;
      const avgPrice = (existingHolding.avgPrice * existingHolding.shares + price * shares) / totalShares;
      newHoldings[symbol] = { symbol, shares: totalShares, avgPrice };
    } else {
      newHoldings[symbol] = { symbol, shares, avgPrice: price };
    }

    // Save portfolio
    const portfolioRef = portfolioDocRef(userId);
    await setDoc(portfolioRef, {
      balance: newBalance,
      holdings: newHoldings,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // Record transaction
    await recordTransaction(userId, {
      type: 'buy',
      symbol,
      shares,
      price,
      total,
    });

    return { success: true, newBalance, newHoldings };
  } catch (error) {
    console.error('Error buying stock:', error);
    return { success: false, error, message: describeFirestoreError(error) };
  }
};

// Sell stock
export const sellStock = async (
  userId: string,
  symbol: string,
  shares: number,
  price: number,
  currentBalance: number,
  currentHoldings: Record<string, Holding>
) => {
  try {
    const holding = currentHoldings[symbol];
    
    if (!holding || holding.shares < shares) {
      return { success: false, error: 'Insufficient shares' };
    }

    const total = shares * price;
    const newBalance = currentBalance + total;
    
    let newHoldings = { ...currentHoldings };
    if (holding.shares === shares) {
      delete newHoldings[symbol];
    } else {
      newHoldings[symbol] = {
        ...holding,
        shares: holding.shares - shares,
      };
    }

    // Save portfolio
    const portfolioRef = portfolioDocRef(userId);
    await setDoc(portfolioRef, {
      balance: newBalance,
      holdings: newHoldings,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // Record transaction
    await recordTransaction(userId, {
      type: 'sell',
      symbol,
      shares,
      price,
      total,
    });

    return { success: true, newBalance, newHoldings };
  } catch (error) {
    console.error('Error selling stock:', error);
    return { success: false, error, message: describeFirestoreError(error) };
  }
};
