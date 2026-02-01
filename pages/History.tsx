
import React from 'react';
import { AppState } from '../types';
import { db } from '../services/mockSupabase';

interface HistoryProps {
  state: AppState;
  onRefresh: () => void;
}

const History: React.FC<HistoryProps> = ({ state, onRefresh }) => {
  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este movimiento?')) {
      await db.deleteTransaction(id);
      onRefresh();
    }
  };

  const getUserName = (userId: string) => {
    return state.members.find(m => m.user_id === userId)?.user?.nombre || 'Usuario';
  };

  const groupedTransactions = state.transactions.reduce((acc: Record<string, typeof state.transactions>, tx) => {
    const date = new Date(tx.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(tx);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-100">Historial</h2>
      
      {Object.entries(groupedTransactions).map(([date, txs]) => (
        <div key={date} className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2 sticky top-20 z-10 bg-slate-950/90 backdrop-blur-sm py-1">{date}</h3>
          <div className="space-y-2">
            {txs.map(tx => (
              <div key={tx.id} className="bg-slate-900 p-4 rounded-2xl flex items-center justify-between shadow-sm border border-slate-800 group transition-all hover:border-slate-700">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center ${tx.tipo === 'gasto' ? 'bg-rose-950 text-rose-500' : 'bg-emerald-950 text-emerald-500'}`}>
                    <i className={`fas ${state.categories.find(c => c.id === tx.categoria_id)?.icon || 'fa-receipt'}`}></i>
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-200 text-sm truncate">
                      {state.categories.find(c => c.id === tx.categoria_id)?.nombre}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight truncate">
                      {getUserName(tx.user_id)} • {tx.nota || tx.metodo_pago}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <p className={`font-bold ${tx.tipo === 'gasto' ? 'text-rose-200' : 'text-emerald-200'}`}>
                    {tx.tipo === 'gasto' ? '-' : '+'}{tx.monto.toLocaleString()}
                  </p>
                  <button 
                    onClick={() => handleDelete(tx.id)}
                    className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {state.transactions.length === 0 && (
        <div className="text-center py-20">
          <div className="bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
            <i className="fas fa-search text-slate-700 text-2xl"></i>
          </div>
          <p className="text-slate-400 font-medium">No hay movimientos registrados</p>
          <p className="text-slate-600 text-sm">Toca el botón "+" en Inicio para empezar</p>
        </div>
      )}
    </div>
  );
};

export default History;
