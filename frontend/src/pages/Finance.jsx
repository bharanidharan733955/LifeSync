import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Download, Filter, Search, ArrowUpRight, ArrowDownRight,
  Tag, ChevronLeft, ChevronRight, Pencil, Trash2, X, Loader2,
  Settings2, IndianRupee, Calendar, CreditCard, LayoutGrid,
  AlertTriangle, AlertOctagon, Layers, ArrowRight, Wallet,
  Target, Repeat
} from 'lucide-react';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import TransactionModal from '../components/finance/TransactionModal.jsx';
import CategoryModal from '../components/finance/CategoryModal.jsx';
import Budgets from './Budgets.jsx';
import SavingsGoals from './SavingsGoals.jsx';
import RecurringTransactions from './RecurringTransactions.jsx';

const PAYMENT_METHOD_LABELS = {
  CASH: 'Cash',
  UPI: 'UPI',
  DEBIT_CARD: 'Debit Card',
  CREDIT_CARD: 'Credit Card',
  BANK_TRANSFER: 'Bank Transfer',
  WALLET: 'Wallet',
  OTHER: 'Other',
};

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function Finance() {
  // ─── Tabs ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' | 'budgets'

  // ─── State ────────────────────────────────────────────────────────────
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [topBudgets, setTopBudgets] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 0 });
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, netBalance: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [sortBy, setSortBy] = useState('transactionDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // Modals
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [deletingTxId, setDeletingTxId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // ─── Fetch categories ─────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories');
      if (res.data?.data) setCategories(res.data.data);
    } catch {
      /* silently fail */
    }
  }, []);

  // ─── Fetch budget summary for Finance Dashboard ───────────────────────
  const fetchBudgetSummary = useCallback(async () => {
    try {
      const res = await api.get('/budgets/summary');
      if (res.data?.data) {
        setBudgetSummary(res.data.data.summary);
        setTopBudgets(res.data.data.budgets?.slice(0, 3) || []);
      }
    } catch {
      /* silently fail */
    }
  }, []);

  // ─── Fetch transactions ───────────────────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', '15');
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      if (search.trim()) params.append('search', search.trim());
      if (typeFilter) params.append('type', typeFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (paymentFilter) params.append('paymentMethod', paymentFilter);

      const res = await api.get(`/transactions?${params.toString()}`);
      if (res.data) {
        setTransactions(res.data.data || []);
        setPagination(res.data.pagination || { total: 0, page: 1, limit: 15, totalPages: 0 });
        setSummary(res.data.summary || { totalIncome: 0, totalExpenses: 0, netBalance: 0 });
      }
    } catch (err) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter, categoryFilter, paymentFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchCategories();
    fetchBudgetSummary();
  }, [fetchCategories, fetchBudgetSummary]);

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [activeTab, fetchTransactions]);

  // ─── Delete transaction ───────────────────────────────────────────────
  const handleDeleteTx = async (txId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    setDeletingTxId(txId);
    try {
      await api.delete(`/transactions/${txId}`);
      toast.success('Transaction deleted');
      fetchTransactions();
      fetchBudgetSummary();
    } catch {
      toast.error('Failed to delete transaction');
    } finally {
      setDeletingTxId(null);
    }
  };

  // ─── Reset filters ────────────────────────────────────────────────────
  const handleResetFilters = () => {
    setSearch('');
    setTypeFilter('');
    setCategoryFilter('');
    setPaymentFilter('');
    setSortBy('transactionDate');
    setSortOrder('desc');
    setPage(1);
  };

  const hasActiveFilters = search || typeFilter || categoryFilter || paymentFilter;

  return (
    <div className="space-y-6">
      {/* ─── Navigation Tabs & Header ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Personal Expense & Income Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track transactions, budgets, savings goals, and export tax-ready statements.
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl self-start sm:self-auto border border-slate-200/50 dark:border-slate-700/50 flex-wrap">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'transactions'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('budgets')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'budgets'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Budgets
            {budgetSummary?.budgetsExceeded > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('savings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'savings'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            Savings Goals
          </button>
          <button
            onClick={() => setActiveTab('recurring')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'recurring'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            Recurring
          </button>
        </div>
      </div>

      {/* ─── Render active sub-view ──────────────────────────────────── */}
      {activeTab === 'budgets' ? (
        <Budgets />
      ) : activeTab === 'savings' ? (
        <SavingsGoals />
      ) : activeTab === 'recurring' ? (
        <RecurringTransactions />
      ) : (
        <>
          {/* ─── Budget Alert Warning Banner ──────────────────────────── */}
          {budgetSummary && (budgetSummary.budgetsExceeded > 0 || budgetSummary.budgetsApproachingThreshold > 0) && (
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition ${
              budgetSummary.budgetsExceeded > 0
                ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  budgetSummary.budgetsExceeded > 0
                    ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400'
                    : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
                }`}>
                  {budgetSummary.budgetsExceeded > 0 ? (
                    <AlertOctagon className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold">
                    {budgetSummary.budgetsExceeded > 0
                      ? `Budget Alert: ${budgetSummary.budgetsExceeded} ${
                          budgetSummary.budgetsExceeded === 1 ? 'budget has' : 'budgets have'
                        } exceeded their limit!`
                      : `Budget Warning: ${budgetSummary.budgetsApproachingThreshold} ${
                          budgetSummary.budgetsApproachingThreshold === 1 ? 'budget is' : 'budgets are'
                        } approaching threshold.`}
                  </h4>
                  <p className="text-xs opacity-85 mt-0.5">
                    Total budget spending: {formatCurrency(budgetSummary.totalSpendingAcrossBudgets)} of{' '}
                    {formatCurrency(budgetSummary.totalBudgetedAmount)} allocated.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('budgets')}
                className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-xs font-bold shadow-xs hover:bg-slate-50 border border-current flex items-center gap-1.5 shrink-0"
              >
                View Budgets
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ─── Summary Cards ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">Total Income</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(summary.totalIncome)}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                  <ArrowDownRight className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">Total Expenses</p>
                  <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(summary.totalExpenses)}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  summary.netBalance >= 0
                    ? 'bg-indigo-100 dark:bg-indigo-900/30'
                    : 'bg-amber-100 dark:bg-amber-900/30'
                }`}>
                  <IndianRupee className={`w-5 h-5 ${
                    summary.netBalance >= 0
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">Net Balance</p>
                  <p className={`text-xl font-bold ${
                    summary.netBalance >= 0
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {summary.netBalance >= 0 ? '+' : ''}{formatCurrency(summary.netBalance)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Active Budgets Snapshot Widget ───────────────────────── */}
          {topBudgets.length > 0 && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span>Active Budget Snapshot</span>
                </div>
                <button
                  onClick={() => setActiveTab('budgets')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
                >
                  View All ({budgetSummary?.totalActiveBudgets || topBudgets.length})
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {topBudgets.map((b) => {
                  const p = b.progress || {};
                  const isOver = p.exceededBudget;
                  const isWarn = !isOver && p.thresholdReached;
                  return (
                    <div
                      key={b._id || b.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {b.name}
                        </span>
                        <span className={`font-semibold text-[11px] ${
                          isOver ? 'text-rose-600' : isWarn ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                          {p.percentageUsed}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isOver ? 'bg-rose-500' : isWarn ? 'bg-amber-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, p.percentageUsed || 0))}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Spent: {formatCurrency(p.spentAmount)}</span>
                        <span>Limit: {formatCurrency(p.budgetAmount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Actions & Header ─────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Transactions History
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCatModalOpen(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Settings2 className="w-4 h-4" />
                Categories
              </button>
              <button
                onClick={() => { setEditingTx(null); setTxModalOpen(true); }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Transaction
              </button>
            </div>
          </div>

          {/* ─── Search & Filter Bar ──────────────────────────────────── */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search by title, merchant, or description..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowFilters((f) => !f)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 border transition ${
                    showFilters || hasActiveFilters
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/50 dark:border-slate-700/50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-1 w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                  )}
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl text-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Expanded filter row */}
            {showFilters && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Types</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <select
                  value={paymentFilter}
                  onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Payment Methods</option>
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
                <select
                  value={`${sortBy}:${sortOrder}`}
                  onChange={(e) => {
                    const [sb, so] = e.target.value.split(':');
                    setSortBy(sb);
                    setSortOrder(so);
                    setPage(1);
                  }}
                  className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="transactionDate:desc">Date (Newest First)</option>
                  <option value="transactionDate:asc">Date (Oldest First)</option>
                  <option value="amount:desc">Amount (High → Low)</option>
                  <option value="amount:asc">Amount (Low → High)</option>
                </select>
              </div>
            )}
          </div>

          {/* ─── Transactions Table ─────────────────────────────────────── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-20 px-6">
                <LayoutGrid className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {hasActiveFilters ? 'No transactions match your filters' : 'No transactions yet'}
                </p>
                <p className="text-sm text-slate-500 mb-4">
                  {hasActiveFilters
                    ? 'Try adjusting or clearing your filters.'
                    : 'Add your first income or expense to start tracking your finances.'}
                </p>
                {!hasActiveFilters && (
                  <button
                    onClick={() => { setEditingTx(null); setTxModalOpen(true); }}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Transaction
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                        <th className="py-3.5 px-4">Transaction</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4 hidden md:table-cell">Payment</th>
                        <th className="py-3.5 px-4 hidden sm:table-cell">Date</th>
                        <th className="py-3.5 px-4 text-right">Amount</th>
                        <th className="py-3.5 px-4 text-right w-20">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                      {transactions.map((tx) => (
                        <tr
                          key={tx._id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {tx.title || tx.description || 'Untitled'}
                            </div>
                            {tx.merchant && (
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {tx.merchant}
                              </span>
                            )}
                            {tx.isFoodExpense && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 ml-2">
                                <Tag className="w-3 h-3" /> Food
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              {tx.category?.color && (
                                <span
                                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: tx.category.color }}
                                />
                              )}
                              <span className="text-slate-600 dark:text-slate-300">
                                {tx.category?.name || '—'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 hidden md:table-cell">
                            {PAYMENT_METHOD_LABELS[tx.paymentMethod] || tx.paymentMethod}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 hidden sm:table-cell">
                            {formatDate(tx.transactionDate || tx.date)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span
                              className={`inline-flex items-center gap-1 font-semibold ${
                                tx.type === 'INCOME'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => { setEditingTx(tx); setTxModalOpen(true); }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTx(tx._id)}
                                disabled={deletingTxId === tx._id}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                                title="Delete"
                              >
                                {deletingTxId === tx._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ─── Pagination ────────────────────────────────────────── */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500">
                      Showing {(pagination.page - 1) * pagination.limit + 1}–
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} transactions
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-40 transition"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="px-3 py-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                        {pagination.page} / {pagination.totalPages}
                      </span>
                      <button
                        disabled={page >= pagination.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-40 transition"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ─── Modals ─────────────────────────────────────────────────── */}
          <TransactionModal
            isOpen={txModalOpen}
            onClose={() => { setTxModalOpen(false); setEditingTx(null); }}
            onSuccess={() => {
              fetchTransactions();
              fetchBudgetSummary();
            }}
            initialData={editingTx}
            categories={categories}
          />
          <CategoryModal
            isOpen={catModalOpen}
            onClose={() => setCatModalOpen(false)}
            categories={categories}
            onCategoriesChange={fetchCategories}
          />
        </>
      )}
    </div>
  );
}
