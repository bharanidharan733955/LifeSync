import React from 'react';
import {
  Target,
  Calendar,
  Clock,
  Pencil,
  Trash2,
  PlusCircle,
  History,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  AlertCircle,
  Flame,
} from 'lucide-react';

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function GoalCard({
  goal,
  onEdit,
  onDelete,
  onAddContribution,
  onViewHistory,
  onToggleStatus,
}) {
  const {
    name,
    targetAmount = 0,
    progress = {},
    status = 'ACTIVE',
    targetDate,
    color = '#10B981',
    description,
  } = goal;

  const savedAmount = progress.savedAmount ?? progress.currentSavedAmount ?? 0;
  const remainingAmount = progress.remainingAmount ?? Math.max(0, targetAmount - savedAmount);
  const percentage = progress.percentage ?? progress.percentageCompleted ?? 0;
  const isTargetReached = progress.isTargetReached || savedAmount >= targetAmount;
  const isExceeded = progress.isExceeded || savedAmount > targetAmount;
  const daysRemaining = progress.daysRemaining;

  const isPaused = status === 'PAUSED';
  const isCompleted = status === 'COMPLETED';

  // Bar width maxes visual at 100%, but label shows real percentage
  const barWidth = Math.min(100, Math.max(0, percentage));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: color || '#10B981' }}
      />

      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm font-semibold shrink-0"
              style={{ backgroundColor: color || '#10B981' }}
            >
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base leading-tight">
                {name}
              </h3>
              {description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1 shrink-0 ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : isPaused
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Reached
              </>
            ) : isPaused ? (
              <>
                <PauseCircle className="w-3.5 h-3.5" /> Paused
              </>
            ) : (
              <>
                <Flame className="w-3.5 h-3.5 text-indigo-500" /> Active
              </>
            )}
          </span>
        </div>

        {/* Amounts & Progress Numbers */}
        <div className="my-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Saved</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Target</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {formatCurrency(savedAmount)}
            </span>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {formatCurrency(targetAmount)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mt-3 relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isTargetReached
                  ? 'bg-emerald-500'
                  : percentage >= 80
                  ? 'bg-amber-500'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${barWidth}%` }}
            />
          </div>

          {/* Percentage & Remaining Text */}
          <div className="flex items-center justify-between text-xs mt-2 text-slate-600 dark:text-slate-400 font-medium">
            <span className={percentage >= 100 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
              {percentage}% funded {isExceeded && '(Exceeded!)'}
            </span>
            <span>
              {isTargetReached ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Goal Achieved!</span>
              ) : (
                `${formatCurrency(remainingAmount)} to go`
              )}
            </span>
          </div>
        </div>

        {/* Metadata: targetDate / days remaining */}
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4 px-1">
          {targetDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Target: {formatDate(targetDate)}</span>
            </div>
          )}
          {daysRemaining !== null && daysRemaining !== undefined && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {daysRemaining === 0 ? 'Due today' : `${daysRemaining} days left`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <button
          onClick={() => onAddContribution(goal)}
          disabled={isPaused}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Add Deposit
        </button>

        <button
          onClick={() => onViewHistory(goal)}
          title="Contribution History"
          className="p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
        >
          <History className="w-4 h-4" />
        </button>

        <button
          onClick={() => onToggleStatus(goal)}
          title={isPaused ? 'Resume Goal' : 'Pause Goal'}
          className="p-2 text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
        >
          {isPaused ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
        </button>

        <button
          onClick={() => onEdit(goal)}
          title="Edit Goal"
          className="p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
        >
          <Pencil className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDelete(goal)}
          title="Delete Goal"
          className="p-2 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

