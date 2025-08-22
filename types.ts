export interface Asset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  holdings: number;
  logo: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  subCategory?: string;
  type: 'income' | 'expense';
}

export interface FuturesTrade {
  id: string;
  pair: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  size: number;
  pnl: number;
  status: 'OPEN' | 'CLOSED';
  date: string;
}

export interface TradeAnalysis {
  overallSummary: string;
  keyStrengths: string[];
  areasForImprovement: string[];
  actionableSuggestions: string[];
  bestTrade: {
    pair: string;
    pnl: number;
    reason: string;
  };
  worstTrade: {
    pair: string;
    pnl: number;
    reason: string;
  };
}

export interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
  emoji: string;
}

export interface Invoice {
  id: string;
  client: string;
  dueDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  amount: number;
}

export interface AppSettings {
  geminiApiKey: string;
  marketDataApiKey: string;
  plaidClientId: string;
  plaidSecret: string;
}

export interface Category {
  id: string;
  name: string;
  subCategories: {
    id: string;
    name: string;
  }[];
}