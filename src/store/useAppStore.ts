import { create } from "zustand";

interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  note?: string;
  transactionDate: string;
  category?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

interface DashboardData {
  balance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  financialHealthScore: number;
  recentTransactions: Transaction[];
  insights: string[];
  projection: {
    projectedBalance: number | null;
    dailyTrend: "improving" | "declining" | "stable" | "insufficient_data";
    currentBalance: number;
  } | null;
  upcomingRecurring?: Record<string, unknown>[];
}

interface AppState {
  // Dashboard
  dashboardData: DashboardData | null;
  isDashboardLoading: boolean;
  setDashboardData: (data: DashboardData) => void;
  setDashboardLoading: (loading: boolean) => void;

  // Transactions
  transactions: Transaction[];
  isTransactionsLoading: boolean;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  setTransactionsLoading: (loading: boolean) => void;

  // UI
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isTransactionModalOpen: boolean;
  setTransactionModalOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Dashboard
  dashboardData: null,
  isDashboardLoading: false,
  setDashboardData: (data) => set({ dashboardData: data }),
  setDashboardLoading: (loading) => set({ isDashboardLoading: loading }),

  // Transactions
  transactions: [],
  isTransactionsLoading: false,
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),
  setTransactionsLoading: (loading) => set({ isTransactionsLoading: loading }),

  // UI
  isSidebarOpen: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  isTransactionModalOpen: false,
  setTransactionModalOpen: (open) => set({ isTransactionModalOpen: open }),
}));
