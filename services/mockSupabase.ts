
import { AppState, User, FamilyGroup, Transaction, Category, Budget, Goal, FamilyMember } from '../types';

const STORAGE_KEY = 'famili_finance_data_v1';

const INITIAL_CATEGORIES: Partial<Category>[] = [
  { nombre: 'Sueldo', tipo: 'ingreso', es_fija: true, icon: 'fa-wallet' },
  { nombre: 'Ventas', tipo: 'ingreso', es_fija: false, icon: 'fa-tag' },
  { nombre: 'Alquiler', tipo: 'gasto', es_fija: true, icon: 'fa-home' },
  { nombre: 'Alimentación', tipo: 'gasto', es_fija: false, icon: 'fa-utensils' },
  { nombre: 'Transporte', tipo: 'gasto', es_fija: false, icon: 'fa-bus' },
  { nombre: 'Salud', tipo: 'gasto', es_fija: false, icon: 'fa-heartbeat' },
  { nombre: 'Ocio', tipo: 'gasto', es_fija: false, icon: 'fa-gamepad' },
  { nombre: 'Servicios Básicos', tipo: 'gasto', es_fija: false, icon: 'fa-lightbulb' },
];

export class MockSupabase {
  private data: AppState;

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      this.data = JSON.parse(stored);
    } else {
      this.data = {
        currentUser: null,
        familyGroup: null,
        members: [],
        categories: [],
        transactions: [],
        budgets: [],
        goals: [],
        loading: false
      };
    }
  }

  private persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  async loginWithGoogle(): Promise<User> {
    const user: User = {
      id: 'u1',
      email: 'demo@family.com',
      nombre: 'Usuario Demo',
      avatar: 'https://picsum.photos/seed/user/100/100'
    };
    this.data = { ...this.data, currentUser: user };
    this.persist();
    return user;
  }

  async logout() {
    this.data = { ...this.data, currentUser: null };
    this.persist();
  }

  async createFamily(nombre: string, moneda: string): Promise<FamilyGroup> {
    if (!this.data.currentUser) throw new Error("No user logged in");
    
    const group: FamilyGroup = {
      id: 'g' + Math.random().toString(36).substr(2, 9),
      nombre,
      moneda,
      creado_por: this.data.currentUser.id
    };
    
    const member: FamilyMember = {
      id: 'm' + Math.random().toString(36).substr(2, 9),
      user_id: this.data.currentUser.id,
      family_group_id: group.id,
      rol: 'admin',
      user: this.data.currentUser
    };

    const categories = INITIAL_CATEGORIES.map(c => ({
      ...c,
      id: 'cat' + Math.random().toString(36).substr(2, 9),
      family_group_id: group.id
    })) as Category[];

    this.data = {
      ...this.data,
      familyGroup: group,
      members: [member],
      categories: categories
    };

    this.persist();
    return group;
  }

  async getDashboardData() {
    // Return a fresh deep-ish copy to ensure React detects state changes
    return JSON.parse(JSON.stringify(this.data));
  }

  async addTransaction(tx: Omit<Transaction, 'id' | 'creado_en'>): Promise<Transaction> {
    const newTx: Transaction = {
      ...tx,
      id: 'tx' + Math.random().toString(36).substr(2, 9),
      creado_en: new Date().toISOString()
    };
    // Immutable update of the transactions array
    this.data = {
      ...this.data,
      transactions: [newTx, ...this.data.transactions]
    };
    this.persist();
    return newTx;
  }

  async deleteTransaction(id: string) {
    this.data = {
      ...this.data,
      transactions: this.data.transactions.filter(t => t.id !== id)
    };
    this.persist();
  }

  async addBudget(budget: Omit<Budget, 'id'>): Promise<Budget> {
    const newBudget: Budget = {
      ...budget,
      id: 'b' + Math.random().toString(36).substr(2, 9)
    };
    this.data = {
      ...this.data,
      budgets: [...this.data.budgets, newBudget]
    };
    this.persist();
    return newBudget;
  }

  async addGoal(goal: Omit<Goal, 'id'>): Promise<Goal> {
    const newGoal: Goal = {
      ...goal,
      id: 'gl' + Math.random().toString(36).substr(2, 9)
    };
    this.data = {
      ...this.data,
      goals: [...this.data.goals, newGoal]
    };
    this.persist();
    return newGoal;
  }

  async updateGoal(id: string, monto_actual: number) {
    this.data = {
      ...this.data,
      goals: this.data.goals.map(g => g.id === id ? { ...g, monto_actual } : g)
    };
    this.persist();
  }
}

export const db = new MockSupabase();
