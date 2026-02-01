
export type UserRole = 'admin' | 'member';
export type TransactionType = 'ingreso' | 'gasto';
export type GoalType = 'ahorro' | 'reducción';

export interface User {
  id: string;
  email: string;
  nombre: string;
  avatar?: string;
}

export interface FamilyGroup {
  id: string;
  nombre: string;
  moneda: string;
  creado_por: string;
}

export interface FamilyMember {
  id: string;
  user_id: string;
  family_group_id: string;
  rol: UserRole;
  user?: User;
}

export interface Category {
  id: string;
  family_group_id: string;
  nombre: string;
  tipo: TransactionType;
  es_fija: boolean;
  icon?: string;
}

export interface Transaction {
  id: string;
  family_group_id: string;
  user_id: string;
  tipo: TransactionType;
  monto: number;
  categoria_id: string;
  metodo_pago: string;
  fecha: string;
  nota?: string;
  creado_en: string;
}

export interface Budget {
  id: string;
  family_group_id: string;
  categoria_id: string | null; // null means total monthly budget
  monto_maximo: number;
  periodo: 'mensual';
}

export interface Goal {
  id: string;
  family_group_id: string;
  nombre: string;
  monto_objetivo: number;
  monto_actual: number;
  tipo: GoalType;
}

export interface AppState {
  currentUser: User | null;
  familyGroup: FamilyGroup | null;
  members: FamilyMember[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  loading: boolean;
}
