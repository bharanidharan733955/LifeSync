import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  Repeat,
  Loader2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import RecurringCard from '../components/finance/RecurringCard.jsx';
import RecurringModal from '../components/finance/RecurringModal.jsx';
import RecurringHistoryModal from '../components/finance/RecurringHistoryModal.jsx';

export default function RecurringTransactions() {
  const [recurringList, setRecurringList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingDue, setProcessingDue] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [frequencyFilter, setFrequencyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedRecurringForHistory, setSelectedRecurringForHistory] = useState(null);

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

  const fetchRecurring = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/finance/recurring-transactions');
      if (res.data?.data) {
        setRecurringList(res.data.data);
      }
    } catch {
      toast.error('Failed to load recurring transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchRecurring();
  }, [fetchCategories, fetchRecurring]);

  const handleDelete = async (recurring) => {
    if (
      !window.confirm(
        `Are you sure you want to stop and delete recurring schedule "${recurring.title}"? (Previously generated transactions will be kept intact.)`
      )
    ) {
      return;
    }

    try {
      const id = recurring._id || recurring.id;
      await api.delete(`/finance/recurring-transactions/${id}`);
      toast.success('Recurring schedule deleted');
      fetchRecurring();
    } catch {
      toast.error('Failed to delete recurring rule');
    }
  };

  const handleToggleStatus = async (recurring) => {
    const id = recurring._id || recurring.id;
    const newIsActive = !recurring.isActive;
    try {
      await api.patch(`/finance/recurring-transactions/${id}/status`, {
        isActive: newIsActive,
      });
      toast.success(
        `Recurring schedule ${newIsActive ? 'resumed' : 'paused'} successfully`
      );
      fetchRecurring();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleProcessDueNow = async () => {
    setProcessingDue(true);
    try {
      const res = await api.post('/finance/recurring-transactions/process-due');
      const count = res.data?.data?.generatedCount || 0;
      if (count > 0) {
        toast.success(`Generated ${count} due transaction${count > 1 ? 's' : ''}!`);
      } else {
        toast.success('All recurring schedules are up-to-date. None due right now.');
      }
      fetchRecurring();
    } catch {
      toast.error('Failed to process due transactions');
    } finally {
      setProcessingDue(false);
    }
  };

  const filteredList = recurringList.filter((r) => {
    if (search.trim()) {
      const s = search.toLowerCase();
      const matchTitle = r.title?.toLowerCase().includes(s);
      const matchDesc = r.description?.toLowerCase().includes(s);
      if (!matchTitle && !matchDesc) return false;
    }

    if (typeFilter !== 'ALL' && r.type !== typeFilter) {
      return false;
    }

    if (frequencyFilter !== 'ALL' && r.frequency !== frequencyFilter) {
      return false;
    }

    if (statusFilter === 'ACTIVE' && !r.isActive) {
      return false;
    }

    if (statusFilter === 'PAUSED' && r.isActive) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Recurring Schedules
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Automate routine income, subscriptions, and recurring bills with calendar-aware scheduling.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleProcessDueNow}
            disabled={processingDue}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {processingDue ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            ) : (
              <Zap className="w-4 h-4 text-amber-500" />
            )}
            Process Due Now
          </button>

          <button
            onClick={() => {
              setEditingRecurring(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            New Recurring Rule
          </button>
        </div>
      </div>

      {/* ─── Filters Bar ────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rules..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Type filter */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            {['ALL', 'EXPENSE', 'INCOME'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  typeFilter === t
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            {['ALL', 'ACTIVE', 'PAUSED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Recurring Cards Grid ───────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mr-3" />
          <span className="text-sm font-medium">Loading recurring rules...</span>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
            <Repeat className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {search || typeFilter !== 'ALL' || statusFilter !== 'ALL'
              ? 'No matching recurring schedules'
              : 'No recurring schedules yet'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {search || typeFilter !== 'ALL' || statusFilter !== 'ALL'
              ? 'Try adjusting your search criteria.'
              : 'Set up automated schedules for subscriptions, bills, salaries, and recurring transfers.'}
          </p>
          {!search && typeFilter === 'ALL' && statusFilter === 'ALL' && (
            <button
              onClick={() => {
                setEditingRecurring(null);
                setIsModalOpen(true);
              }}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Schedule First Rule
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredList.map((r) => {
            const id = r._id || r.id;
            return (
              <RecurringCard
                key={id}
                recurring={r}
                onEdit={(item) => {
                  setEditingRecurring(item);
                  setIsModalOpen(true);
                }}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onViewHistory={(item) => {
                  setSelectedRecurringForHistory(item);
                  setIsHistoryModalOpen(true);
                }}
              />
            );
          })}
        </div>
      )}

      {/* ─── Modals ─────────────────────────────────────────────────── */}
      <RecurringModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchRecurring}
        initialData={editingRecurring}
        categories={categories}
      />

      <RecurringHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        recurring={selectedRecurringForHistory}
      />
    </div>
  );
}

