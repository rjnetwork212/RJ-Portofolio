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
