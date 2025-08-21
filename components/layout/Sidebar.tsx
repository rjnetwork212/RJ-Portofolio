import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../../constants';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-20 md:w-64 bg-slate-900 flex flex-col border-r border-slate-800">
      <div className="flex items-center justify-center h-20 border-b border-slate-800">
        <div className="text-cyan-400 w-10 h-10 flex items-center justify-center bg-cyan-400/10 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-100 hidden md:block ml-3">Zenith</h1>
      </div>
      <nav className="flex-1 px-2 md:px-4 py-4 space-y-2">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-colors duration-200 justify-center md:justify-start ${
                isActive
                  ? 'bg-cyan-500 text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`
            }
          >
            {link.icon}
            <span className="ml-4 hidden md:block">{link.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
