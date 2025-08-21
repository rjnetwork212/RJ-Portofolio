import React, { useState } from 'react';
import { analyzeTradingPerformance } from '../services/geminiService';
import type { TradeAnalysis, FuturesTrade } from '../types';
import { supabase } from '../lib/supabaseClient';

const supabaseToTrade = (item: any): FuturesTrade => ({
  id: item.id,
  pair: item.pair,
  type: item.type,
  entryPrice: item.entry_price,
  exitPrice: item.exit_price,
  size: item.size,
  pnl: item.pnl,
  status: item.status,
  date: item.date,
});

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center space-x-2">
        <div className="w-4 h-4 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]"></div>
	    <div className="w-4 h-4 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]"></div>
	    <div className="w-4 h-4 rounded-full bg-cyan-400 animate-bounce"></div>
    </div>
);

const AnalysisResult: React.FC<{ analysis: TradeAnalysis }> = ({ analysis }) => {
    const TradeCard: React.FC<{ title: string; trade: TradeAnalysis['bestTrade'] | TradeAnalysis['worstTrade']; isBest: boolean }> = ({ title, trade, isBest }) => (
        <div className={`p-6 rounded-lg ${isBest ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'} border`}>
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{title}</h3>
            <p className="mt-2 text-slate-700 dark:text-slate-300"><span className="font-semibold">{trade.pair}</span> - PnL: <span className={isBest ? 'text-green-500' : 'text-red-500'}>${trade.pnl.toFixed(2)}</span></p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{trade.reason}</p>
        </div>
    );
    
    return (
        <div className="space-y-6 mt-8 animate-fade-in">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Overall Summary</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{analysis.overallSummary}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                <TradeCard title="Best Trade" trade={analysis.bestTrade} isBest={true} />
                <TradeCard title="Worst Trade" trade={analysis.worstTrade} isBest={false} />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gray-100 dark:bg-slate-800 p-6 rounded-lg">
                    <h3 className="font-bold text-lg text-green-500 mb-3">Key Strengths</h3>
                    <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                        {analysis.keyStrengths.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
                <div className="bg-gray-100 dark:bg-slate-800 p-6 rounded-lg">
                    <h3 className="font-bold text-lg text-orange-500 mb-3">Areas for Improvement</h3>
                    <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                        {analysis.areasForImprovement.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
                <div className="bg-gray-100 dark:bg-slate-800 p-6 rounded-lg">
                    <h3 className="font-bold text-lg text-cyan-500 mb-3">Actionable Suggestions</h3>
                    <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                        {analysis.actionableSuggestions.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const TradingAssistant: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<TradeAnalysis | null>(null);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            // First, fetch the latest trades from the database
            const { data, error: fetchError } = await supabase
                .from('futures_trades')
                .select('*');
                
            if (fetchError) throw new Error('Could not fetch latest trades for analysis.');
            
            const trades: FuturesTrade[] = data.map(supabaseToTrade);
            
            // Then, send them for analysis
            const result = await analyzeTradingPerformance(trades);
            setAnalysis(result);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-gray-200 dark:border-slate-800 max-w-5xl mx-auto">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-cyan-500/10 rounded-full flex items-center justify-center border-2 border-cyan-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-4">AI Trading Assistant</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl mx-auto">
                    Get objective, AI-powered insights on your futures trading performance. Your trade history will be analyzed to identify patterns, strengths, and weaknesses.
                </p>
            </div>
            
            <div className="text-center mt-8">
                <button 
                    onClick={handleAnalyze} 
                    disabled={isLoading}
                    className="bg-cyan-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-cyan-600 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105"
                >
                    {isLoading ? 'Analyzing...' : 'Analyze My Trades'}
                </button>
            </div>
            
            {isLoading && (
                <div className="mt-8 text-center">
                    <LoadingSpinner />
                    <p className="text-slate-500 dark:text-slate-400 mt-4">AI is analyzing your trades. This might take a moment...</p>
                </div>
            )}

            {error && <div className="mt-8 text-center p-4 bg-red-500/10 text-red-500 rounded-lg">{error}</div>}

            {analysis && <AnalysisResult analysis={analysis} />}
        </div>
    );
};

export default TradingAssistant;