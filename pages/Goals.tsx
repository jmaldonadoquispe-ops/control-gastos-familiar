
import React, { useState } from 'react';
import { AppState } from '../types';
import { db } from '../services/mockSupabase';

interface GoalsProps {
  state: AppState;
  onRefresh: () => void;
}

const Goals: React.FC<GoalsProps> = ({ state, onRefresh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !target || !state.familyGroup) return;

    await db.addGoal({
      family_group_id: state.familyGroup.id,
      nombre: name,
      monto_objetivo: parseFloat(target),
      monto_actual: 0,
      tipo: 'ahorro'
    });
    setName('');
    setTarget('');
    setIsAdding(false);
    onRefresh();
  };

  const handleContribute = async (id: string, current: number) => {
    const amount = prompt('¿Cuánto deseas aportar a esta meta?');
    if (amount) {
      await db.updateGoal(id, current + parseFloat(amount));
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-100">Metas de Ahorro</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
        >
          {isAdding ? 'Cerrar' : '+ Nueva Meta'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-slate-900 p-6 rounded-[28px] shadow-sm border border-slate-800 space-y-4 animate-slide-up">
          <h3 className="font-bold text-slate-200">Nueva Meta</h3>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nombre de la Meta</label>
            <input
              type="text"
              placeholder="Ej: Vacaciones 2025"
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-none focus:border-emerald-500 placeholder:text-slate-600"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Monto Objetivo</label>
            <input
              type="number"
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-none focus:border-emerald-500"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white p-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20">
            Crear Meta
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {state.goals.map(goal => {
          const percent = Math.min((goal.monto_actual / goal.monto_objetivo) * 100, 100);
          return (
            <div key={goal.id} className="bg-slate-900 p-6 rounded-[32px] border border-slate-800 shadow-sm overflow-hidden relative group transition-all hover:border-slate-700">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <i className="fas fa-bullseye text-6xl text-emerald-400"></i>
              </div>
              
              <h4 className="font-bold text-slate-100 mb-1">{goal.nombre}</h4>
              <p className="text-xs text-slate-500 font-medium mb-4">Meta de Ahorro Familiar</p>

              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Progreso</p>
                  <p className="font-bold text-lg text-slate-100">{goal.monto_actual.toLocaleString()} <span className="text-slate-500 text-sm">/ {goal.monto_objetivo.toLocaleString()}</span></p>
                </div>
                <p className="font-bold text-2xl text-emerald-400">{Math.round(percent)}%</p>
              </div>

              <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden mb-6">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <button 
                onClick={() => handleContribute(goal.id, goal.monto_actual)}
                className="w-full bg-slate-100 text-slate-900 p-3 rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-all"
              >
                Hacer un Aporte
              </button>
            </div>
          );
        })}

        {state.goals.length === 0 && !isAdding && (
          <div className="text-center py-20 bg-slate-900/50 rounded-[32px] border border-dashed border-slate-800">
            <i className="fas fa-bullseye text-slate-800 text-4xl mb-3"></i>
            <p className="text-slate-600 text-sm px-10 font-medium">Define tus sueños familiares y ahorra paso a paso para cumplirlos.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;
