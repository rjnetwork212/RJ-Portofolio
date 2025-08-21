import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Transactions from './pages/Transactions';
import FuturesTrading from './pages/FuturesTrading';
import TradingAssistant from './pages/TradingAssistant';
import Settings from './pages/Settings';
import { NAV_LINKS } from './constants';
import { CategoryProvider } from './contexts/CategoryContext';
import { SettingsProvider } from './contexts/SettingsContext';

const App: React.FC = () => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark';
    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <SettingsProvider>
      <CategoryProvider>
        <HashRouter>
          <div className="flex h-screen bg-gray-100 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-300">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <MainContent toggleTheme={toggleTheme} currentTheme={theme} />
            </div>
          </div>
        </HashRouter>
      </CategoryProvider>
    </SettingsProvider>
  );
};

interface MainContentProps {
  toggleTheme: () => void;
  currentTheme: string;
}

const MainContent: React.FC<MainContentProps> = ({ toggleTheme, currentTheme }) => {
  const location = useLocation();
  const currentLink = NAV_LINKS.find(link => link.path === location.pathname) || NAV_LINKS[0];

  return (
    <>
      <Header title={currentLink.name} toggleTheme={toggleTheme} currentTheme={currentTheme} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-slate-950 p-6 md:p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/futures-trading" element={<FuturesTrading />} />
          <Route path="/ai-assistant" element={<TradingAssistant />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </>
  );
}

export default App;