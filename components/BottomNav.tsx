
import React from 'react';
import { NavLink } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/', icon: 'fa-chart-pie', label: 'Inicio' },
    { to: '/history', icon: 'fa-list-ul', label: 'Historial' },
    { to: '/budgets', icon: 'fa-piggy-bank', label: 'Presupuestos' },
    { to: '/goals', icon: 'fa-bullseye', label: 'Metas' },
    { to: '/settings', icon: 'fa-cog', label: 'Ajustes' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 safe-area-bottom z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive ? 'text-indigo-400' : 'text-slate-500'
              }`
            }
          >
            <i className={`fas ${item.icon} text-xl mb-1`}></i>
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
