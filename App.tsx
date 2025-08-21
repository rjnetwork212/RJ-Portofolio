import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Transactions from './pages/Transactions';
import FuturesTrading from './pages/FuturesTrading';
import TradingAssistant from './pages/TradingAssistant';
import { NAV_LINKS } from './constants';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-950 font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <MainContent />
        </div>
      </div>
    </HashRouter>
  );
};

const MainContent: React.FC = () => {
  const location = useLocation();
  const currentLink = NAV_LINKS.find(link => link.path === location.pathname) || NAV_LINKS[0];

  return (
    <>
      <Header title={currentLink.name} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-950 p-6 md:p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/futures-trading" element={<FuturesTrading />} />
          <Route path="/ai-assistant" element={<TradingAssistant />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
