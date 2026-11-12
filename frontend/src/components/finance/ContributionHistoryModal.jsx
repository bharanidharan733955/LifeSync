import React, { useState, useEffect, useCallback } from 'react';
import { X, History, Trash2, Loader2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function ContributionHistoryModal({ isOpen, onClose, goal, onHistoryChanged }) {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchContributions = useCallback(async () => {
    if (!goal) return;
    setLoading(true);
    try {
      const id = goal._id || goal.id;
      const res = await api.get(`/finance/savings-goals/${id}/contributions`);
      if (res.data?.data) {
        setContributions(res.data.data);
      }
    } catch {
      toast.error('Failed to load contributions');
    } finally {
      setLoading(false);
    }
  }, [goal]);

  useEffect(() => {
    if (isOpen && goal) {
      fetchContributions();
    }
  }, [isOpen, goal, fetchContributions]);

  if (!isOpen || !goal) return null;

  const handleDelete = async (contribution) => {
    if (!window.confirm(`Delete deposit of ${formatCurrency(contribution.amount)}?`)) {
      return;
    }
    const goalId = goal._id || goal.id;
    const contribId = contribution._id || contribution.id;
    setDeletingId(contribId);
    try {
      await api.delete(`/finance/savings-goals/${goalId}/contributions/${contribId}`);
      toast.success('Deposit removed and progress recalculated');
      fetchContributions();
      onHistoryChanged();
    } catch {
      toast.error('Failed to delete contribution');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Deposit History
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{goal.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading deposit history...</span>
            </div>
          ) : contributions.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <History className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No deposits yet
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Add your first deposit to start progressing toward your target!
              </p>
            </div>
          ) : (
            contributions.map((c) => {
              const cId = c._id || c.id;
              const isDeleting = deletingId === cId;
              return (
                <div
                  key={cId}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/70 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-base">
                        +{formatCurrency(c.amount)}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-medium">
                        {c.source || 'MANUAL'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formatDate(c.contributionDate)}</span>
                      </div>
                      {c.description && <span>• {c.description}</span>}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(c)}
                    disabled={isDeleting}
                    title="Delete deposit"
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

