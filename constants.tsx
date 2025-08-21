import React from 'react';
import type { Asset, Transaction, FuturesTrade } from './types';

// SVG Icons
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const PortfolioIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);
const TransactionsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
);
const TradingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4m0 0l4 4m-4-4v18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 17l-4 4m0 0l-4-4m4 4V3" />
    </svg>
);
const AiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

export const NAV_LINKS = [
  { name: 'Dashboard', path: '/', icon: <HomeIcon /> },
  { name: 'Portfolio', path: '/portfolio', icon: <PortfolioIcon /> },
  { name: 'Transactions', path: '/transactions', icon: <TransactionsIcon /> },
  { name: 'Futures Trading', path: '/futures-trading', icon: <TradingIcon /> },
  { name: 'AI Assistant', path: '/ai-assistant', icon: <AiIcon /> },
];

// Mock Data
export const MOCK_CRYPTO_ASSETS: Asset[] = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', price: 68500.00, change24h: 2.5, marketCap: 1350000000000, holdings: 0.5, logo: 'https://img.icons8.com/fluency/48/bitcoin.png' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', price: 3500.00, change24h: -1.2, marketCap: 420000000000, holdings: 5, logo: 'https://img.icons8.com/fluency/48/ethereum.png' },
  { id: 'sol', name: 'Solana', symbol: 'SOL', price: 170.00, change24h: 5.8, marketCap: 78000000000, holdings: 100, logo: 'https://img.icons8.com/fluency/48/solana.png' },
];

export const MOCK_STOCK_ASSETS: Asset[] = [
  { id: 'aapl', name: 'Apple Inc.', symbol: 'AAPL', price: 210.50, change24h: 1.1, marketCap: 3220000000000, holdings: 50, logo: 'https://img.icons8.com/ios-filled/50/mac-os.png' },
  { id: 'tsla', name: 'Tesla, Inc.', symbol: 'TSLA', price: 180.20, change24h: -2.3, marketCap: 575000000000, holdings: 25, logo: 'https://img.icons8.com/color/48/tesla-logo.png' },
  { id: 'nvda', name: 'NVIDIA Corp', symbol: 'NVDA', price: 125.90, change24h: 3.5, marketCap: 3090000000000, holdings: 75, logo: 'https://img.icons8.com/ios-filled/50/nvidia.png' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
    { id: '1', date: '2024-07-20', description: 'Monthly Salary', amount: 5000, category: 'Income', type: 'income' },
    { id: '2', date: '2024-07-19', description: 'Groceries', amount: -150.75, category: 'Food', type: 'expense' },
    { id: '3', date: '2024-07-18', description: 'Gasoline', amount: -55.20, category: 'Transport', type: 'expense' },
    { id: '4', date: '2024-07-18', description: 'Cloud Server Bill', amount: -35.00, category: 'Utilities', type: 'expense' },
    { id: '5', date: '2024-07-17', description: 'Freelance Project', amount: 750, category: 'Income', type: 'income' },
    { id: '6', date: '2024-07-16', description: 'Dinner Out', amount: -85.50, category: 'Food', type: 'expense' },
    { id: '7', date: '2024-07-15', description: 'Stock Dividend', amount: 120, category: 'Investment', type: 'income' },
    { id: '8', date: '2024-07-15', description: 'Gym Membership', amount: -40.00, category: 'Health', type: 'expense' },
];

export const MOCK_FUTURES_TRADES: FuturesTrade[] = [
    { id: 't1', pair: 'BTC/USDT', type: 'LONG', entryPrice: 65000, exitPrice: 68000, size: 0.1, pnl: 300, status: 'CLOSED', date: '2024-07-15' },
    { id: 't2', pair: 'ETH/USDT', type: 'SHORT', entryPrice: 3600, exitPrice: 3500, size: 2, pnl: 200, status: 'CLOSED', date: '2024-07-16' },
    { id: 't3', pair: 'SOL/USDT', type: 'LONG', entryPrice: 160, exitPrice: 155, size: 10, pnl: -50, status: 'CLOSED', date: '2024-07-17' },
    { id: 't4', pair: 'BTC/USDT', type: 'SHORT', entryPrice: 69000, exitPrice: 69500, size: 0.2, pnl: -100, status: 'CLOSED', date: '2024-07-18' },
    { id: 't5', pair: 'ETH/USDT', type: 'LONG', entryPrice: 3450, exitPrice: 3550, size: 3, pnl: 300, status: 'CLOSED', date: '2024-07-19' },
    { id: 't6', pair: 'RNDR/USDT', type: 'LONG', entryPrice: 7.5, exitPrice: 0, size: 100, pnl: 0, status: 'OPEN', date: '2024-07-20' },
];
