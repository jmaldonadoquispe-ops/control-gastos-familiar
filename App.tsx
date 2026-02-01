
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { db } from './services/mockSupabase';
import { AppState, User, FamilyGroup } from './types';

// Pages
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Budgets from './pages/Budgets';
import Goals from './pages/Goals';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';

// Layout
import BottomNav from './components/BottomNav';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    familyGroup: null,
    members: [],
    categories: [],
    transactions: [],
    budgets: [],
    goals: [],
    loading: true
  });

  const refreshData = useCallback(async () => {
    const data = await db.getDashboardData();
    setState({ ...data, loading: false });
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleLogin = async () => {
    await db.loginWithGoogle();
    await refreshData();
  };

  const handleCreateFamily = async (name: string, currency: string) => {
    await db.createFamily(name, currency);
    await refreshData();
  };

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!state.currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  if (!state.familyGroup) {
    return <Onboarding onCreateFamily={handleCreateFamily} />;
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-950 flex flex-col pb-20 text-slate-100">
        <header className="bg-slate-900 px-4 py-4 sticky top-0 z-30 shadow-md flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <i className="fas fa-hand-holding-dollar text-white"></i>
            </div>
            <h1 className="font-bold text-slate-100 text-lg">FamiliFinance</h1>
          </div>
          <div className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded">
            {state.familyGroup.nombre} ({state.familyGroup.moneda})
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Dashboard state={state} onRefresh={refreshData} />} />
            <Route path="/history" element={<History state={state} onRefresh={refreshData} />} />
            <Route path="/budgets" element={<Budgets state={state} onRefresh={refreshData} />} />
            <Route path="/goals" element={<Goals state={state} onRefresh={refreshData} />} />
            <Route path="/settings" element={<Settings state={state} onRefresh={refreshData} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <BottomNav />
      </div>
    </HashRouter>
  );
};

export default App;
