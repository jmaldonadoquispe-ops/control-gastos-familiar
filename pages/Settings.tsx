
import React from 'react';
import { AppState } from '../types';
import { db } from '../services/mockSupabase';

interface SettingsProps {
  state: AppState;
  onRefresh: () => void;
}

const Settings: React.FC<SettingsProps> = ({ state, onRefresh }) => {
  const handleLogout = async () => {
    await db.logout();
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-100">Ajustes</h2>

      {/* Profile Section */}
      <div className="bg-slate-900 p-6 rounded-[32px] border border-slate-800 shadow-sm flex items-center gap-4">
        <img src={state.currentUser?.avatar} alt="Profile" className="w-16 h-16 rounded-2xl border-4 border-slate-800 shadow-sm" />
        <div>
          <h3 className="font-bold text-slate-100">{state.currentUser?.nombre}</h3>
          <p className="text-xs text-slate-500 font-medium">{state.currentUser?.email}</p>
          <div className="mt-2 inline-block px-2 py-1 bg-indigo-950/40 text-indigo-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            {state.members.find(m => m.user_id === state.currentUser?.id)?.rol === 'admin' ? 'Administrador' : 'Miembro'}
          </div>
        </div>
      </div>

      {/* Family Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Grupo Familiar</h3>
        <div className="bg-slate-900 rounded-[32px] border border-slate-800 shadow-sm divide-y divide-slate-800">
          <div className="p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Nombre del Grupo</span>
            <span className="text-sm font-bold text-slate-200">{state.familyGroup?.nombre}</span>
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Moneda</span>
            <span className="text-sm font-bold text-indigo-400 underline cursor-pointer">{state.familyGroup?.moneda}</span>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Miembros</h3>
          <button className="text-xs font-bold text-indigo-400 underline">Invitar</button>
        </div>
        <div className="bg-slate-900 p-2 rounded-[32px] border border-slate-800 shadow-sm space-y-1">
          {state.members.map(member => (
            <div key={member.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-800 transition-colors">
              <img src={member.user?.avatar} alt="" className="w-10 h-10 rounded-xl" />
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-200">{member.user?.nombre}</p>
                <p className="text-[10px] text-slate-500 font-medium">{member.rol === 'admin' ? 'Dueño del Grupo' : 'Editor'}</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Categorías</h3>
        <div className="bg-slate-900 p-2 rounded-[32px] border border-slate-800 shadow-sm">
           <div className="grid grid-cols-2 gap-2">
            {state.categories.slice(0, 6).map(cat => (
              <div key={cat.id} className="p-3 bg-slate-800 rounded-2xl flex items-center gap-2">
                <i className={`fas ${cat.icon} text-slate-500 text-xs`}></i>
                <span className="text-xs font-bold text-slate-400 truncate">{cat.nombre}</span>
              </div>
            ))}
            <div className="p-3 bg-indigo-950/20 rounded-2xl flex items-center justify-center gap-2 border border-dashed border-indigo-900/50">
               <span className="text-xs font-bold text-indigo-400">Ver todas</span>
            </div>
           </div>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full p-4 bg-slate-900 border border-rose-900 text-rose-400 rounded-2xl font-bold shadow-sm active:bg-rose-950/30 transition-colors mt-8 mb-4"
      >
        <i className="fas fa-sign-out-alt mr-2"></i>
        Cerrar Sesión
      </button>

      <p className="text-center text-[10px] text-slate-700 font-medium pb-8 uppercase tracking-widest">
        FamiliFinance v1.0.0
      </p>
    </div>
  );
};

export default Settings;
