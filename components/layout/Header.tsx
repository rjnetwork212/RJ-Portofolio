import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="h-20 flex items-center justify-between px-8 bg-slate-900 border-b border-slate-800 flex-shrink-0">
      <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full text-slate-400 hover:bg-slate-800 hover:text-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
        </button>
        <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden">
            <img src="https://picsum.photos/100/100" alt="User Avatar" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
};

export default Header;
