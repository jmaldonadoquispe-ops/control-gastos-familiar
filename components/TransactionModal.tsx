
import React, { useState } from 'react';
import { AppState, TransactionType, Category } from '../types';
import { db } from '../services/mockSupabase';

interface TransactionModalProps {
  state: AppState;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ state, isOpen, onClose, onSuccess }) => {
  const [type, setType] = useState<TransactionType>('gasto');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [method, setMethod] = useState('Efectivo');
  const [note, setNote] = useState('');
  // Set default date to today in YYYY-MM-DD format
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const filteredCategories = state.categories.filter(c => c.tipo === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId || !state.currentUser || !state.familyGroup) return;

    setLoading(true);
    try {
      // Use the selected date. We append a dummy time to ensure it parses correctly as a date.
      const transactionDate = new Date(date + 'T12:00:00').toISOString();
      
      await db.addTransaction({
        family_group_id: state.familyGroup.id,
        user_id: state.currentUser.id,
        tipo: type,
        monto: parseFloat(amount),
        categoria_id: categoryId,
        metodo_pago: method,
        fecha: transactionDate,
        nota: note
      });
      onSuccess();
      onClose();
      // Reset
      setAmount('');
      setCategoryId('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 rounded-t-[32px] p-6 animate-slide-up max-h-[90vh] overflow-y-auto border-t border-slate-800">
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6" onClick={onClose} />
        
        <h3 className="text-xl font-bold text-slate-100 mb-6">Nuevo Movimiento</h3>

        <div className="flex p-1 bg-slate-800 rounded-2xl mb-6">
          <button
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${type === 'gasto' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400'}`}
            onClick={() => setType('gasto')}
          >
            Gasto
          </button>
          <button
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${type === 'ingreso' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400'}`}
            onClick={() => setType('ingreso')}
          >
            Ingreso
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Monto ({state.familyGroup?.moneda})</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                autoFocus
                className="w-full text-3xl font-bold p-0 bg-transparent border-none outline-none text-slate-100 placeholder:text-slate-700"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fecha</label>
              <input
                type="date"
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl outline-none text-slate-100 focus:border-indigo-500 text-sm"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Categoría</label>
              <select
                className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl outline-none text-slate-100 focus:border-indigo-500"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="" className="bg-slate-900">Seleccionar...</option>
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-slate-900">{cat.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Método de Pago</label>
              <select
                className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl outline-none text-slate-100 focus:border-indigo-500"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="Efectivo" className="bg-slate-900">Efectivo</option>
                <option value="Tarjeta Débito" className="bg-slate-900">Tarjeta Débito</option>
                <option value="Tarjeta Crédito" className="bg-slate-900">Tarjeta Crédito</option>
                <option value="Transferencia" className="bg-slate-900">Transferencia</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nota (Opcional)</label>
            <input
              type="text"
              placeholder="¿De qué fue este movimiento?"
              className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl outline-none text-slate-100 focus:border-indigo-500 placeholder:text-slate-600"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className={`w-full p-4 rounded-2xl text-white font-bold text-lg shadow-lg active:scale-95 transition-all mt-4 ${
              type === 'gasto' ? 'bg-rose-500 shadow-rose-900/20' : 'bg-emerald-500 shadow-emerald-900/20'
            }`}
          >
            {loading ? 'Procesando...' : 'Confirmar Movimiento'}
          </button>
        </form>
      </div>
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        /* Style for date input to look better in dark mode */
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }
      `}</style>
    </div>
  );
};

export default TransactionModal;
