
import React, { useState } from 'react';

interface OnboardingProps {
  onCreateFamily: (name: string, currency: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onCreateFamily }) => {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('Bs');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateFamily(name, currency);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="max-w-md mx-auto pt-12">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">¡Bienvenido!</h2>
        <p className="text-slate-500 mb-8">Primero, vamos a crear el espacio para tu familia.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-400 mb-2">Nombre del Grupo</label>
            <input
              type="text"
              placeholder="Ej: Familia García"
              className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-slate-100 placeholder:text-slate-700"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-400 mb-2">Moneda Principal</label>
            <select
              className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all appearance-none text-slate-100"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="Bs" className="bg-slate-900">Bolivianos (Bs)</option>
              <option value="USD" className="bg-slate-900">USD ($)</option>
              <option value="EUR" className="bg-slate-900">EUR (€)</option>
              <option value="ARS" className="bg-slate-900">ARS ($)</option>
              <option value="MXN" className="bg-slate-900">MXN ($)</option>
              <option value="COP" className="bg-slate-900">COP ($)</option>
              <option value="PEN" className="bg-slate-900">PEN (S/)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold shadow-2xl shadow-indigo-900/40 active:scale-[0.98] transition-all"
          >
            Comenzar mi aventura financiera
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
