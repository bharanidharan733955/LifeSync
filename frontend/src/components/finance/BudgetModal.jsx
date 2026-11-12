import React, { useState, useEffect } from 'react';
import { X, Loader2, Tag, Layers, Calendar, DollarSign, BellRing } from 'lucide-react';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

export default function BudgetModal({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
  categories = [],
}) {
  const [name, setName] = useState('');
  const [budgetType, setBudgetType] = useState('CATEGORY');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('MONTHLY');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setBudgetType(initialData.budgetType || 'CATEGORY');
      setCategoryId(initialData.category?._id || initialData.category || '');
      setAmount(initialData.amount ? initialData.amount.toString() : '');
      setPeriod(initialData.period || 'MONTHLY');
      setStartDate(
        initialData.startDate
          ? new Date(initialData.startDate).toISOString().split('T')[0]
          : ''
      );
      setEndDate(
        initialData.endDate
          ? new Date(initialData.endDate).toISOString().split('T')[0]
          : ''
      );
      setAlertThreshold(initialData.alertThreshold || 80);
      setIsActive(initialData.isActive !== undefined ? initialData.isActive : true);
      setNotes(initialData.notes || '');
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setName('');
    setBudgetType('CATEGORY');
    setCategoryId('');
    setAmount('');
    setPeriod('MONTHLY');
    setStartDate('');
    setEndDate('');
    setAlertThreshold(80);
    setIsActive(true);
    setNotes('');
  };

  if (!isOpen) return null;

  // Expense categories only
  const expenseCategories = categories.filter(
    (c) => c.type === 'EXPENSE' || c.type === 'BOTH'
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a budget name');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid positive budget amount');
      return;
    }

    if (budgetType === 'CATEGORY' && !categoryId) {
      toast.error('Please select a category for this category budget');
      return;
    }

    if (period === 'CUSTOM') {
      if (!startDate || !endDate) {
        toast.error('Start and end dates are required for custom periods');
        return;
      }
      if (new Date(startDate) >= new Date(endDate)) {
        toast.error('Start date must be before end date');
        return;
      }
    }

    const payload = {
      name: name.trim(),
      budgetType,
      category: budgetType === 'CATEGORY' ? categoryId : null,
      amount: numAmount,
      currency: 'INR',
      period,
      alertThreshold: Number(alertThreshold),
      isActive,
      notes: notes.trim() || null,
    };

    if (period === 'CUSTOM' || startDate) {
      payload.startDate = new Date(startDate).toISOString();
    }
    if (period === 'CUSTOM' || endDate) {
      payload.endDate = new Date(endDate).toISOString();
    }

    setIsSubmitting(true);
    try {
      if (initialData?._id || initialData?.id) {
        const id = initialData._id || initialData.id;
        await api.put(`/budgets/${id}`, payload);
        toast.success('Budget updated successfully');
      } else {
        await api.post('/budgets', payload);
        toast.success('Budget created successfully');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save budget';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const alertAmountPreview = amount && !isNaN(parseFloat(amount))
    ? Math.round((parseFloat(amount) * (alertThreshold / 100)) * 100) / 100
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {initialData ? 'Edit Budget' : 'Create New Budget'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Set spending limits and receive proactive threshold warnings
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Budget Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Budget Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Groceries & Essentials, Total Monthly Limit"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Budget Type Toggle: Category vs Overall */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Budget Scope
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setBudgetType('CATEGORY')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  budgetType === 'CATEGORY'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                Category Budget
              </button>
              <button
                type="button"
                onClick={() => {
                  setBudgetType('OVERALL');
                  setCategoryId('');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  budgetType === 'OVERALL'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Overall Budget
              </button>
            </div>
          </div>

          {/* Category Dropdown (Conditional) */}
          {budgetType === 'CATEGORY' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Target Category <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="">Select Category</option>
                {expenseCategories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.isSystem ? '' : '(Custom)'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Amount & Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Budget Limit (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-medium">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="5000.00"
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Period
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="MONTHLY">Monthly (Calendar Month)</option>
                <option value="WEEKLY">Weekly (Mon – Sun)</option>
                <option value="CUSTOM">Custom Date Range</option>
              </select>
            </div>
          </div>

          {/* Custom Date Pickers */}
          {period === 'CUSTOM' && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Start Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  End Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Alert Threshold Slider */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 text-amber-500" />
                Alert Threshold
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {alertThreshold}% {alertAmountPreview > 0 && `(₹${alertAmountPreview.toLocaleString('en-IN')})`}
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              You will receive an in-app visual warning once spending reaches {alertThreshold}% of this budget.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Includes weekend dining and cafe visits"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="isActiveBudget"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
            />
            <label
              htmlFor="isActiveBudget"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Active budget (track active expenses against this limit)
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition flex items-center gap-2 shadow-sm disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : initialData ? (
                'Update Budget'
              ) : (
                'Create Budget'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

