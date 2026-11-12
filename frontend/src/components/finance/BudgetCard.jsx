import React from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Calendar,
  Pencil,
  Trash2,
  Tag,
  Layers,
} from 'lucide-react';

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function BudgetCard({ budget, onEdit, onDelete }) {
  const p = budget.progress || {
    budgetAmount: budget.amount || 0,
    spentAmount: 0,
    remainingAmount: budget.amount || 0,
    percentageUsed: 0,
    percentageRemaining: 100,
    thresholdReached: false,
    exceededBudget: false,
    transactionCount: 0,
    daysRemaining: 0,
    status: 'NORMAL',
    alertThreshold: budget.alertThreshold || 80,
  };

  const isExceeded = p.exceededBudget || p.status === 'EXCEEDED';
  const isWarning = !isExceeded && (p.thresholdReached || p.status === 'WARNING');
  const isExpired = p.status === 'EXPIRED';

  // Badge styling & icon for accessibility (not relying on color alone)
  let statusBadge = (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
      <CheckCircle2 className="w-3.5 h-3.5" /> On Track
    </span>
  );

  let progressBarColor = 'bg-emerald-500 dark:bg-emerald-400';
  let cardBorderColor = 'border-slate-200/80 dark:border-slate-800';

  if (isExceeded) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60">
        <AlertOctagon className="w-3.5 h-3.5" /> Exceeded Limit
      </span>
    );
    progressBarColor = 'bg-rose-500';
    cardBorderColor = 'border-rose-300 dark:border-rose-900/60 shadow-rose-500/5';
  } else if (isWarning) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
        <AlertTriangle className="w-3.5 h-3.5" /> Near Limit (≥{p.alertThreshold}%)
      </span>
    );
    progressBarColor = 'bg-amber-500';
    cardBorderColor = 'border-amber-300 dark:border-amber-900/60 shadow-amber-500/5';
  } else if (isExpired) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300/60 dark:border-slate-700/60">
        <Clock className="w-3.5 h-3.5" /> Period Ended
      </span>
    );
    progressBarColor = 'bg-slate-400';
  }

  // Visual width of progress bar (clamp display width at 100% so it doesn't overflow container)
  const displayProgressWidth = Math.min(100, Math.max(0, p.percentageUsed));

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border ${cardBorderColor} shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
    >
      <div>
        {/* Top Header: Category/Overall type and Status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {budget.budgetType === 'CATEGORY' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                <Tag className="w-3 h-3" />
                {budget.category?.name || 'Category'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
                <Layers className="w-3 h-3" />
                Overall Budget
              </span>
            )}
            <span className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
              {budget.period}
            </span>
          </div>
          {statusBadge}
        </div>

        {/* Budget Title */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-1">
          {budget.name}
        </h3>
        {budget.notes && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">
            {budget.notes}
          </p>
        )}

        {/* Amounts Display */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500">
              Spent
            </p>
            <p className={`text-base font-bold ${
              isExceeded ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'
            }`}>
              {formatCurrency(p.spentAmount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500">
              {isExceeded ? 'Over Budget By' : 'Remaining'}
            </p>
            <p
              className={`text-base font-bold ${
                isExceeded
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {isExceeded ? '-' : ''}{formatCurrency(Math.abs(p.remainingAmount))}
            </p>
          </div>
        </div>

        {/* Progress Bar with Percentage Label */}
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-500 dark:text-slate-400">
              {p.percentageUsed}% consumed
            </span>
            <span className="text-slate-400 dark:text-slate-500">
              Limit: {formatCurrency(p.budgetAmount)}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressBarColor}`}
              style={{ width: `${displayProgressWidth}%` }}
            />
          </div>
        </div>

        {/* Date details and days remaining */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(budget.startDate)} – {formatDate(budget.endDate)}
          </span>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {isExpired ? 'Expired' : `${p.daysRemaining} days left`}
          </span>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <span className="text-slate-400">
          {p.transactionCount} {p.transactionCount === 1 ? 'expense' : 'expenses'}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit?.(budget)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition"
            title="Edit Budget"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete?.(budget)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
            title="Delete Budget"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

