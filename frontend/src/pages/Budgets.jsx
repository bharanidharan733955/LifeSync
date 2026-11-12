import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  AlertTriangle,
  AlertOctagon,
  Layers,
  Tag,
  Loader2,
  Calendar,
  IndianRupee,
  Sparkles,
} from 'lucide-react';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import BudgetCard from '../components/finance/BudgetCard.jsx';
import BudgetModal from '../components/finance/BudgetModal.jsx';

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({
    totalActiveBudgets: 0,
    totalBudgetedAmount: 0,
    totalSpendingAcrossBudgets: 0,
    totalRemainingAmount: 0,
    totalActualExpenses: 0,
    budgetsApproachingThreshold: 0,
    budgetsExceeded: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories');
      if (res.data?.data) {
        setCategories(res.data.data);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const fetchBudgetsAndSummary = useCallback(async () => {
    setLoading(true);
    try {
      // Parallel fetch summary & budgets
      const [summaryRes, budgetsRes] = await Promise.all([
        api.get('/budgets/summary'),
        api.get('/budgets'),
      ]);

      if (summaryRes.data?.data?.summary) {
        setSummary(summaryRes.data.data.summary);
      }
      if (budgetsRes.data?.data) {
        setBudgets(budgetsRes.data.data);
      }
    } catch (err) {
      toast.error('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchBudgetsAndSummary();
  }, [fetchCategories, fetchBudgetsAndSummary]);

  const handleDeleteBudget = async (budget) => {
    if (!window.confirm(`Are you sure you want to delete budget "${budget.name}"? Transactions will NOT be affected.`)) {
      return;
    }

    try {
      const id = budget._id || budget.id;
      await api.delete(`/budgets/${id}`);
      toast.success('Budget deleted successfully');
      fetchBudgetsAndSummary();
    } catch {
      toast.error('Failed to delete budget');
    }
  };

  // Client-side filtering across the loaded budgets
  const filteredBudgets = budgets.filter((b) => {
    if (search.trim()) {
      const s = search.toLowerCase();
      const matchName = b.name?.toLowerCase().includes(s);
      const matchCat = b.category?.name?.toLowerCase().includes(s);
      const matchNotes = b.notes?.toLowerCase().includes(s);
      if (!matchName && !matchCat && !matchNotes) return false;
    }

    if (typeFilter && b.budgetType !== typeFilter) {
      return false;
    }

    if (periodFilter && b.period !== periodFilter) {
      return false;
    }

    if (statusFilter === 'EXCEEDED' && !b.progress?.exceededBudget) {
      return false;
    }

    if (statusFilter === 'WARNING' && (!b.progress?.thresholdReached || b.progress?.exceededBudget)) {
      return false;
    }

    if (statusFilter === 'ACTIVE' && !b.isActive) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Budget Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track expenses against allocated limits, prevent overspending, and manage financial goals.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingBudget(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition shadow-sm flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Budget
        </button>
      </div>

      {/* ─── Summary Metrics Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budgeted */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
            Total Budgeted
          </p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {formatCurrency(summary.totalBudgetedAmount)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Across {summary.totalActiveBudgets} active {summary.totalActiveBudgets === 1 ? 'budget' : 'budgets'}
          </p>
        </div>

        {/* Total Spent */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
            Total Spent
          </p>
          <p className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(summary.totalSpendingAcrossBudgets)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Actual month expenses: {formatCurrency(summary.totalActualExpenses)}
          </p>
        </div>

        {/* Total Remaining */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
            Total Remaining
          </p>
          <p className={`text-xl sm:text-2xl font-bold mt-1 ${
            summary.totalRemainingAmount >= 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }`}>
            {summary.totalRemainingAmount >= 0 ? '+' : ''}{formatCurrency(summary.totalRemainingAmount)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Net balance under limits
          </p>
        </div>

        {/* Alerts & Warnings */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
            Budget Alerts
          </p>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>{summary.budgetsApproachingThreshold} near limit</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-sm">
              <AlertOctagon className="w-4 h-4" />
              <span>{summary.budgetsExceeded} exceeded</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {summary.budgetsExceeded > 0 ? 'Urgent attention required' : 'Spending within planned bounds'}
          </p>
        </div>
      </div>

      {/* ─── Search & Filters ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search budgets by name, category, or note..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300"
          >
            <option value="">All Scopes</option>
            <option value="CATEGORY">Category Budgets</option>
            <option value="OVERALL">Overall Budgets</option>
          </select>

          {/* Period Filter */}
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300"
          >
            <option value="">All Periods</option>
            <option value="MONTHLY">Monthly</option>
            <option value="WEEKLY">Weekly</option>
            <option value="CUSTOM">Custom</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="WARNING">Near Limit (≥Threshold)</option>
            <option value="EXCEEDED">Exceeded Limit</option>
          </select>
        </div>
      </div>

      {/* ─── Budgets Grid ────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : filteredBudgets.length === 0 ? (
        <div className="text-center py-20 px-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
            {search || typeFilter || periodFilter || statusFilter !== 'ALL'
              ? 'No budgets match your filters'
              : 'No budgets created yet'}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
            {search || typeFilter || periodFilter || statusFilter !== 'ALL'
              ? 'Try adjusting or clearing your search filters to find what you are looking for.'
              : 'Take control of your spending by setting monthly or category-based budgets.'}
          </p>
          <button
            onClick={() => {
              setEditingBudget(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl inline-flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Your First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBudgets.map((b) => (
            <BudgetCard
              key={b._id || b.id}
              budget={b}
              onEdit={(bud) => {
                setEditingBudget(bud);
                setIsModalOpen(true);
              }}
              onDelete={handleDeleteBudget}
            />
          ))}
        </div>
      )}

      {/* ─── Modal ──────────────────────────────────────────────────── */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        onSuccess={fetchBudgetsAndSummary}
        initialData={editingBudget}
        categories={categories}
      />
    </div>
  );
}

