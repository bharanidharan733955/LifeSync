import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  Target,
  Loader2,
  CheckCircle2,
  Flame,
  PauseCircle,
  Coins,
  IndianRupee,
} from 'lucide-react';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import GoalCard from '../components/finance/GoalCard.jsx';
import GoalModal from '../components/finance/GoalModal.jsx';
import ContributionModal from '../components/finance/ContributionModal.jsx';
import ContributionHistoryModal from '../components/finance/ContributionHistoryModal.jsx';

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState({
    totalGoals: 0,
    activeGoals: 0,
    completedGoals: 0,
    totalSaved: 0,
    totalTarget: 0,
    remainingAmount: 0,
    overallPercentage: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [isContribModalOpen, setIsContribModalOpen] = useState(false);
  const [selectedGoalForContrib, setSelectedGoalForContrib] = useState(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedGoalForHistory, setSelectedGoalForHistory] = useState(null);

  const fetchGoalsAndSummary = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, goalsRes] = await Promise.all([
        api.get('/finance/savings-goals/summary'),
        api.get('/finance/savings-goals'),
      ]);

      if (summaryRes.data?.data) {
        setSummary(summaryRes.data.data);
      }
      if (goalsRes.data?.data) {
        setGoals(goalsRes.data.data);
      }
    } catch {
      toast.error('Failed to load savings goals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoalsAndSummary();
  }, [fetchGoalsAndSummary]);

  const handleDeleteGoal = async (goal) => {
    if (
      !window.confirm(
        `Are you sure you want to delete goal "${goal.name}" and all its recorded deposits?`
      )
    ) {
      return;
    }

    try {
      const id = goal._id || goal.id;
      await api.delete(`/finance/savings-goals/${id}`);
      toast.success('Savings goal deleted');
      fetchGoalsAndSummary();
    } catch {
      toast.error('Failed to delete savings goal');
    }
  };

  const handleToggleStatus = async (goal) => {
    const id = goal._id || goal.id;
    const newStatus = goal.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED';
    try {
      await api.patch(`/finance/savings-goals/${id}/status`, { status: newStatus });
      toast.success(`Goal ${newStatus === 'ACTIVE' ? 'resumed' : 'paused'}`);
      fetchGoalsAndSummary();
    } catch {
      toast.error('Failed to update goal status');
    }
  };

  const filteredGoals = goals.filter((g) => {
    if (search.trim()) {
      const s = search.toLowerCase();
      const matchName = g.name?.toLowerCase().includes(s);
      const matchDesc = g.description?.toLowerCase().includes(s);
      if (!matchName && !matchDesc) return false;
    }

    if (statusFilter !== 'ALL' && g.status !== statusFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Savings Goals</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Set targets, build wealth, and track your milestone deposits over time.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGoal(null);
            setIsGoalModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Create New Goal
        </button>
      </div>

      {/* ─── Summary Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Saved */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Saved
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(summary.totalSaved)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Target: {formatCurrency(summary.totalTarget)}
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Overall Progress
            </span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {summary.overallPercentage || 0}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {formatCurrency(summary.remainingAmount)} remaining
            </div>
          </div>
        </div>

        {/* Active Goals */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Goals
            </span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {summary.activeGoals || 0}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Of {summary.totalGoals || 0} total goals
            </div>
          </div>
        </div>

        {/* Completed Goals */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Completed Goals
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {summary.completedGoals || 0}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Goals successfully reached
            </div>
          </div>
        </div>
      </div>

      {/* ─── Filters Bar ────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search goals..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          {['ALL', 'ACTIVE', 'COMPLETED', 'PAUSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Goals Grid ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mr-3" />
          <span className="text-sm font-medium">Loading savings goals...</span>
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
            <Target className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {search || statusFilter !== 'ALL' ? 'No matching goals found' : 'No savings goals yet'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {search || statusFilter !== 'ALL'
              ? 'Try adjusting your search query or filter options.'
              : 'Create your first goal to set targets and track your deposit progress.'}
          </p>
          {!search && statusFilter === 'ALL' && (
            <button
              onClick={() => {
                setEditingGoal(null);
                setIsGoalModalOpen(true);
              }}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Create First Goal
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGoals.map((goal) => {
            const id = goal._id || goal.id;
            return (
              <GoalCard
                key={id}
                goal={goal}
                onEdit={(g) => {
                  setEditingGoal(g);
                  setIsGoalModalOpen(true);
                }}
                onDelete={handleDeleteGoal}
                onAddContribution={(g) => {
                  setSelectedGoalForContrib(g);
                  setIsContribModalOpen(true);
                }}
                onViewHistory={(g) => {
                  setSelectedGoalForHistory(g);
                  setIsHistoryModalOpen(true);
                }}
                onToggleStatus={handleToggleStatus}
              />
            );
          })}
        </div>
      )}

      {/* ─── Modals ─────────────────────────────────────────────────── */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSuccess={fetchGoalsAndSummary}
        initialData={editingGoal}
      />

      <ContributionModal
        isOpen={isContribModalOpen}
        onClose={() => setIsContribModalOpen(false)}
        onSuccess={fetchGoalsAndSummary}
        goal={selectedGoalForContrib}
      />

      <ContributionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        goal={selectedGoalForHistory}
        onHistoryChanged={fetchGoalsAndSummary}
      />
    </div>
  );
}

