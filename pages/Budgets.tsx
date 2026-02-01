
import React, { useState } from 'react';
import { AppState } from '../types';
import { db } from '../services/mockSupabase';

interface BudgetsProps {
  state: AppState;
  onRefresh: () => void;
}

const Budgets: React.FC<BudgetsProps> = ({ state, onRefresh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [catId, setCatId] = useState('');
  const [amount, setAmount] = useState('');

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !state.familyGroup) return;
    
    await db.addBudget({
      family_group_id: state.familyGroup.id,
      categoria_id: catId || null,
      monto_maximo: parseFloat(amount),
      periodo: 'mensual'
    });
    setCatId('');
    setAmount('');
    setIsAdding(false);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-100">Presupuestos</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-900/20 active:scale-95 transition-all"
        >
          {isAdding ? 'Cerrar' : '+ Crear'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-slate-900 p-6 rounded-[28px] shadow-sm border border-slate-800 space-y-4 animate-slide-up">
          <h3 className="font-bold text-slate-200">Configurar Límite</h3>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Categoría (Opcional)</label>
            <select
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-none focus:border-indigo-500"
              value={catId}
              onChange={(e) => setCatId(e.target.value)}
            >
              <option value="" className="bg-slate-900">Todo el Mes</option>
              {state.categories.filter(c => c.tipo === 'gasto').map(cat => (
                <option key={cat.id} value={cat.id} className="bg-slate-900">{cat.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Monto Máximo</label>
            <input
              type="number"
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-none focus:border-indigo-500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold shadow-lg shadow-indigo-900/20">
            Guardar Presupuesto
          </button>
        </form>
      )}

      <div className="space-y-4">
        {state.budgets.map(b => {
          const spent = state.transactions
            .filter(t => t.tipo === 'gasto' && 
                        new Date(t.fecha).getMonth() === currentMonth &&
                        new Date(t.fecha).getFullYear() === currentYear &&
                        (b.categoria_id ? t.categoria_id === b.categoria_id : true))
            .reduce((acc, t) => acc + t.monto, 0);
          
          const percent = Math.min((spent / b.monto_maximo) * 100, 100);
          const catName = b.categoria_id ? state.categories.find(c => c.id === b.categoria_id)?.nombre : 'Gasto Total';

          return (
            <div key={b.id} className="bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-800 transition-all hover:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-bold text-slate-200">{catName}</h4>
                  <p className="text-xs text-slate-500 font-medium">Periodo Mensual</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-slate-100">
                    {spent.toLocaleString()} / <span className="text-slate-500">{b.monto_maximo.toLocaleString()}</span>
                  </p>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase">{Math.round(percent)}% utilizado</p>
                </div>
              </div>
              
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    percent >= 100 ? 'bg-rose-500' : percent >= 80 ? 'bg-amber-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              
              {percent >= 80 && (
                <p className={`text-[10px] mt-2 font-bold ${percent >= 100 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {percent >= 100 ? '¡Límite de presupuesto excedido!' : '¡Estás cerca de tu límite!'}
                </p>
              )}
            </div>
          );
        })}

        {state.budgets.length === 0 && !isAdding && (
          <div className="text-center py-20 bg-slate-900/50 rounded-[32px] border border-dashed border-slate-800">
            <i className="fas fa-piggy-bank text-slate-800 text-4xl mb-3"></i>
            <p className="text-slate-600 text-sm px-10">Crea presupuestos para no gastar más de lo planeado en cada categoría.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Budgets;
