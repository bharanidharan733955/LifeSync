import React from 'react';
import {
  Repeat,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  Pencil,
  Trash2,
  History,
  PauseCircle,
  PlayCircle,
  Tag,
  CreditCard,
} from 'lucide-react';

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

const FREQUENCY_LABELS = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
};

export default function RecurringCard({
  recurring,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewHistory,
}) {
  const {
    type,
    title,
    description,
    amount,
    frequency,
    interval = 1,
    category,
    paymentMethod,
    nextOccurrence,
    isActive,
    startDate,
    endDate,
  } = recurring;

  const isIncome = type === 'INCOME';

  const frequencyDisplay =
    interval > 1
      ? `Every ${interval} ${frequency.toLowerCase()}s`
      : FREQUENCY_LABELS[frequency] || frequency;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
              isIncome
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            }`}
          >
            {isIncome ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {isIncome ? 'Recurring Income' : 'Recurring Expense'}
          </span>

          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1 ${
              isActive
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {isActive ? 'Active' : 'Paused'}
          </span>
        </div>

        {/* Title & Amount */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {description}
              </p>
            )}
          </div>
          <span
            className={`text-lg font-bold shrink-0 ${
              isIncome
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            {isIncome ? '+' : '-'}
            {formatCurrency(amount)}
          </span>
        </div>

        {/* Schedule & Category info */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 my-3 space-y-2 text-xs border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Repeat className="w-3.5 h-3.5 text-indigo-500" />
              Frequency
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {frequencyDisplay}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Next Due
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatDate(nextOccurrence) || 'Completed'}
            </span>
          </div>

          {category && (
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Category
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {category.name || 'General'}
              </span>
            </div>
          )}

          {paymentMethod && (
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                Payment
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {paymentMethod.replace(/_/g, ' ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <button
          onClick={() => onToggleStatus(recurring)}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition ${
            isActive
              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
          }`}
        >
          {isActive ? (
            <>
              <PauseCircle className="w-3.5 h-3.5" /> Pause Rule
            </>
          ) : (
            <>
              <PlayCircle className="w-3.5 h-3.5" /> Resume Rule
            </>
          )}
        </button>

        <button
          onClick={() => onViewHistory(recurring)}
          title="Generated Transaction History"
          className="p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
        >
          <History className="w-4 h-4" />
        </button>

        <button
          onClick={() => onEdit(recurring)}
          title="Edit Recurring Rule"
          className="p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
        >
          <Pencil className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDelete(recurring)}
          title="Delete Recurring Rule"
          className="p-2 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

