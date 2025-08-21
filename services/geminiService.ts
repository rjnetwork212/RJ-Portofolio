import type { FuturesTrade, TradeAnalysis } from '../types';

export const analyzeTradingPerformance = async (trades: FuturesTrade[]): Promise<TradeAnalysis> => {
  const closedTrades = trades.filter(t => t.status === 'CLOSED');
  if (closedTrades.length === 0) {
      throw new Error("No closed trades available for analysis.");
  }

  try {
    const response = await fetch('/api/analyze-trades', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trades: closedTrades }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to get analysis from AI.");
    }

    const analysisResult = await response.json();
    return analysisResult as TradeAnalysis;

  } catch (error) {
    console.error("Error fetching analysis:", error);
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error("An unknown error occurred while fetching the analysis.");
  }
};
