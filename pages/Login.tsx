
import React from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-900/50 mb-8">
        <i className="fas fa-hand-holding-dollar text-white text-4xl"></i>
      </div>
      <h1 className="text-3xl font-bold text-slate-100 mb-2">FamiliFinance</h1>
      <p className="text-slate-400 mb-12 max-w-xs">
        Toma el control de tus finanzas familiares hoy mismo.
      </p>
      
      <button
        onClick={onLogin}
        className="w-full max-w-sm bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform text-slate-200"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
        <span className="font-semibold">Continuar con Google</span>
      </button>

      <div className="mt-12 text-slate-600 text-sm uppercase tracking-widest font-bold">
        <p>Seguro • Privado • Compartido</p>
      </div>
    </div>
  );
};

export default Login;
