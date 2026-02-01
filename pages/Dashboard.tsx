
import React, { useState, useMemo } from 'react';
import { AppState, Transaction } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import TransactionModal from '../components/TransactionModal';

interface DashboardProps {
  state: AppState;
  onRefresh: () => void;
}

type TimeRange = 'day' | 'month' | 'year';

const Dashboard: React.FC<DashboardProps> = ({ state, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  
  // Estados para filtros específicos
  const [selectedFullDate, setSelectedFullDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [selectedMonthYear, setSelectedMonthYear] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString()); // YYYY

  const months = [
    { name: 'Enero', val: '01' }, { name: 'Febrero', val: '02' }, { name: 'Marzo', val: '03' },
    { name: 'Abril', val: '04' }, { name: 'Mayo', val: '05' }, { name: 'Junio', val: '06' },
    { name: 'Julio', val: '07' }, { name: 'Agosto', val: '08' }, { name: 'Septiembre', val: '09' },
    { name: 'Octubre', val: '10' }, { name: 'Noviembre', val: '11' }, { name: 'Diciembre', val: '12' }
  ];

  // Extraer años disponibles para los filtros
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    years.add(new Date().getFullYear().toString());
    state.transactions.forEach(tx => {
      const year = tx.fecha.slice(0, 4);
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [state.transactions]);

  // Obtener presupuesto total del mes (donde categoria_id es null)
  const totalMonthlyBudget = useMemo(() => {
    return state.budgets.find(b => b.categoria_id === null)?.monto_maximo || 0;
  }, [state.budgets]);

  const stats = useMemo(() => {
    let filteredTxs: Transaction[] = [];
    let label = '';

    switch (timeRange) {
      case 'day':
        filteredTxs = state.transactions.filter(t => t.fecha.startsWith(selectedFullDate));
        const dateObj = new Date(selectedFullDate + 'T12:00:00');
        label = `del ${dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`;
        break;
      case 'month':
        filteredTxs = state.transactions.filter(t => t.fecha.startsWith(selectedMonthYear));
        const [y, m] = selectedMonthYear.split('-');
        const monthName = months.find(mn => mn.val === m)?.name;
        label = `de ${monthName} ${y}`;
        break;
      case 'year':
        filteredTxs = state.transactions.filter(t => t.fecha.startsWith(selectedYear));
        label = `del Año ${selectedYear}`;
        break;
    }

    const income = filteredTxs
      .filter(t => t.tipo === 'ingreso')
      .reduce((acc, t) => acc + t.monto, 0);
      
    const expenses = filteredTxs
      .filter(t => t.tipo === 'gasto')
      .reduce((acc, t) => acc + t.monto, 0);
      
    const balance = income - expenses;

    const categoryMap: Record<string, number> = {};
    filteredTxs.filter(t => t.tipo === 'gasto').forEach(t => {
      const cat = state.categories.find(c => c.id === t.categoria_id)?.nombre || 'Otros';
      categoryMap[cat] = (categoryMap[cat] || 0) + t.monto;
    });

    const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // Alarma visual: Si el gasto supera el presupuesto mensual
    const isOverBudget = totalMonthlyBudget > 0 && expenses > totalMonthlyBudget;
    
    const barData = [
      { name: 'Ingresos', monto: income, color: '#10b981' },
      { name: 'Gastos', monto: expenses, color: isOverBudget ? '#ef4444' : '#f43f5e' },
    ];

    return { 
      income, 
      expenses, 
      balance, 
      pieData, 
      barData, 
      filteredTxs, 
      label,
      isOverBudget,
      dataKey: `${timeRange}-${selectedFullDate}-${selectedMonthYear}-${selectedYear}-${filteredTxs.length}` 
    };
  }, [state.transactions, state.categories, timeRange, selectedFullDate, selectedMonthYear, selectedYear, totalMonthlyBudget]);

  const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  const getUserName = (userId: string) => {
    return state.members.find(m => m.user_id === userId)?.user?.nombre || 'Usuario';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Selector de Rango y Filtros Dinámicos */}
      <div className="space-y-4">
        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
          {(['day', 'month', 'year'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`flex-1 min-w-[70px] py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                timeRange === range 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {range === 'day' ? 'Día' : range === 'month' ? 'Mes' : 'Año'}
            </button>
          ))}
        </div>

        <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {timeRange === 'day' ? 'Seleccionar Fecha' : timeRange === 'month' ? 'Seleccionar Mes' : 'Seleccionar Año'}
            </span>
            
            {timeRange === 'day' && (
              <input 
                type="date" 
                value={selectedFullDate}
                onChange={(e) => setSelectedFullDate(e.target.value)}
                className="bg-transparent text-indigo-400 font-bold text-sm outline-none cursor-pointer"
              />
            )}

            {timeRange === 'month' && (
              <div className="flex gap-2">
                <select 
                  value={selectedMonthYear.split('-')[1]}
                  onChange={(e) => {
                    const [y] = selectedMonthYear.split('-');
                    setSelectedMonthYear(`${y}-${e.target.value}`);
                  }}
                  className="bg-transparent text-indigo-400 font-bold text-sm outline-none cursor-pointer"
                >
                  {months.map(m => <option key={m.val} value={m.val} className="bg-slate-900">{m.name}</option>)}
                </select>
                <select 
                  value={selectedMonthYear.split('-')[0]}
                  onChange={(e) => {
                    const [, m] = selectedMonthYear.split('-');
                    setSelectedMonthYear(`${e.target.value}-${m}`);
                  }}
                  className="bg-transparent text-indigo-400 font-bold text-sm outline-none cursor-pointer"
                >
                  {availableYears.map(y => <option key={y} value={y} className="bg-slate-900">{y}</option>)}
                </select>
              </div>
            )}

            {timeRange === 'year' && (
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-indigo-400 font-bold text-sm outline-none cursor-pointer"
              >
                {availableYears.map(y => <option key={y} value={y} className="bg-slate-900">{y}</option>)}
              </select>
            )}
          </div>
          <div className="text-slate-700">
            <i className={`fas ${timeRange === 'day' ? 'fa-calendar-day' : timeRange === 'month' ? 'fa-calendar-alt' : 'fa-calendar'} text-xl opacity-20`}></i>
          </div>
        </div>
      </div>

      {/* Tarjeta de Balance con Alerta de Presupuesto */}
      <div className={`rounded-[32px] p-6 text-white shadow-2xl transition-all duration-500 relative overflow-hidden ${
        stats.isOverBudget ? 'bg-rose-600 shadow-rose-900/40 ring-2 ring-rose-400/50 ring-offset-4 ring-offset-slate-950' : 'bg-indigo-600 shadow-indigo-900/20'
      }`}>
        <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-1">
            <p className="text-white/80 text-sm font-medium">Balance {stats.label}</p>
            {stats.isOverBudget && (
              <span className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold uppercase border border-white/20 animate-pulse">
                Exceso de Gasto
              </span>
            )}
          </div>
          <h2 className="text-4xl font-bold mb-6 tracking-tight">
            {state.familyGroup?.moneda} {stats.balance.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <i className="fas fa-arrow-down text-emerald-400 text-xs"></i>
                <span className="text-xs font-bold text-white/70 uppercase tracking-tighter">Ingresos</span>
              </div>
              <p className="font-bold text-lg leading-tight">+{stats.income.toLocaleString('es-BO')}</p>
            </div>
            <div className={`backdrop-blur-md rounded-2xl p-3 border transition-colors ${stats.isOverBudget ? 'bg-rose-950/40 border-rose-400/30' : 'bg-white/10 border-white/10'}`}>
              <div className="flex items-center gap-2 mb-1">
                <i className={`fas fa-arrow-up text-xs ${stats.isOverBudget ? 'text-white' : 'text-rose-400'}`}></i>
                <span className="text-xs font-bold text-white/70 uppercase tracking-tighter">Gastos</span>
              </div>
              <p className="font-bold text-lg leading-tight">-{stats.expenses.toLocaleString('es-BO')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Análisis Visual Reordenado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Flujo de Efectivo - AHORA PRIMERO */}
        <div className="bg-slate-900 p-6 rounded-[32px] shadow-sm border border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest">Flujo de Efectivo</h3>
            {totalMonthlyBudget > 0 && (
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                Límite: {state.familyGroup?.moneda} {totalMonthlyBudget.toLocaleString()}
              </span>
            )}
          </div>
          <div className="h-56">
             <ResponsiveContainer width="100%" height="100%" key={`bar-${stats.dataKey}`}>
              <BarChart data={stats.barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip 
                   cursor={{fill: 'transparent'}}
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '12px', color: '#f1f5f9' }}
                   itemStyle={{ color: '#f1f5f9' }}
                />
                {totalMonthlyBudget > 0 && (
                  <ReferenceLine 
                    y={totalMonthlyBudget} 
                    stroke="#475569" 
                    strokeDasharray="3 3" 
                    label={{ position: 'right', value: 'Meta', fill: '#475569', fontSize: 8, fontWeight: 'bold' }} 
                  />
                )}
                <Bar dataKey="monto" radius={[8, 8, 0, 0]} animationDuration={1200}>
                  {stats.barData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      className={index === 1 && stats.isOverBudget ? 'animate-pulse' : ''} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gastos por Categoría - AHORA SEGUNDO */}
        <div className="bg-slate-900 p-6 rounded-[32px] shadow-sm border border-slate-800">
          <h3 className="font-bold text-slate-400 mb-4 text-xs uppercase tracking-widest">Gastos por Categoría</h3>
          <div className="h-56">
            {stats.pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" key={`pie-${stats.dataKey}`}>
                <PieChart>
                  <Pie
                    data={stats.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="#0f172a"
                    strokeWidth={2}
                    animationDuration={1000}
                  >
                    {stats.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '12px', color: '#f1f5f9' }}
                    itemStyle={{ color: '#f1f5f9' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-700">
                <i className="fas fa-chart-pie text-3xl mb-2 opacity-20"></i>
                <p className="text-xs font-bold uppercase tracking-widest">Sin gastos registrados</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actividad */}
      <div className="flex flex-col gap-4">
        <h3 className="font-bold text-slate-500 text-xs uppercase tracking-widest px-2">Actividad {stats.label}</h3>
        <div className="space-y-3">
          {stats.filteredTxs.slice(0, 10).map(tx => (
            <div key={tx.id} className="bg-slate-900 p-4 rounded-2xl flex items-center justify-between border border-slate-800 transition-all hover:bg-slate-800/50">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center ${tx.tipo === 'gasto' ? 'bg-rose-950/50 text-rose-500' : 'bg-emerald-950/50 text-emerald-500'}`}>
                  <i className={`fas ${state.categories.find(c => c.id === tx.categoria_id)?.icon || (tx.tipo === 'gasto' ? 'fa-minus' : 'fa-plus')}`}></i>
                </div>
                <div className="truncate">
                  <p className="font-bold text-slate-200 text-sm truncate">
                    {state.categories.find(c => c.id === tx.categoria_id)?.nombre || 'General'}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                    {getUserName(tx.user_id)} • {tx.metodo_pago}
                  </p>
                </div>
              </div>
              <p className={`font-bold flex-shrink-0 ml-2 ${tx.tipo === 'gasto' ? 'text-rose-200' : 'text-emerald-200'}`}>
                {tx.tipo === 'gasto' ? '-' : '+'}{tx.monto.toLocaleString('es-BO')}
              </p>
            </div>
          ))}
          {stats.filteredTxs.length === 0 && (
            <div className="text-center py-10 bg-slate-900/30 rounded-[32px] border border-dashed border-slate-800">
              <i className="fas fa-receipt text-slate-800 text-4xl mb-3 opacity-20"></i>
              <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">Sin movimientos registrados para esta fecha</p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-indigo-900/40 active:scale-90 transition-transform z-40 border-4 border-slate-950"
      >
        <i className="fas fa-plus text-xl"></i>
      </button>

      <TransactionModal
        state={state}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onRefresh}
      />
    </div>
  );
};

export default Dashboard;
