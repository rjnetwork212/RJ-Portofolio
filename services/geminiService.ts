import type { FuturesTrade, TradeAnalysis } from '../types';
import { supabase } from '../lib/supabaseClient';

export const analyzeTradingPerformance = async (trades: FuturesTrade[]): Promise<TradeAnalysis> => {
  const closedTrades = trades.filter(t => t.status === 'CLOSED');
  if (closedTrades.length === 0) {
      throw new Error("No closed trades available for analysis.");
  }

  try {
    // Invoke a Supabase Edge Function instead of a Vercel API route
    const { data, error } = await supabase.functions.invoke('analyze-trades', {
      body: { trades: closedTrades },
    });

    if (error) {
      throw new Error(error.message || "Failed to get analysis from AI Edge Function.");
    }

    // The data returned from the function is the analysis result
    return data as TradeAnalysis;

  } catch (error) {
    console.error("Error invoking Supabase function:", error);
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error("An unknown error occurred while fetching the analysis.");
  }
};