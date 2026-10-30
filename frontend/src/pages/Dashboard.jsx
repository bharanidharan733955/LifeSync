import React, { useEffect, useState } from 'react';
import {
  Wallet,
  Utensils,
  Candy,
  Droplet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api.js';

const mockFinanceData = [
  { name: 'Mon', income: 4200, expense: 1200 },
  { name: 'Tue', income: 3000, expense: 2100 },
  { name: 'Wed', income: 2000, expense: 980 },
  { name: 'Thu', income: 2780, expense: 3908 },
  { name: 'Fri', income: 1890, expense: 4800 },
  { name: 'Sat', income: 2390, expense: 3800 },
  { name: 'Sun', income: 3490, expense: 4300 },
];

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    income: 75400,
    expenses: 32650,
    calories: 1840,
    calorieTarget: 2200,
    sugarGrams: 28,
    sugarLimit: 36,
    waterMl: 2200,
    waterTarget: 3000,
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        if (res.data?.data) {
          // Sync with live backend analytics endpoint
        }
      } catch (err) {
        // Fall back gracefully to active local state
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome back to LifeTrack 👋
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here is your financial and nutritional synchronization for today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Daily Advice
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Savings Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Net Balance</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              ₹{(metrics.income - metrics.expenses).toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+14.2% from last month</span>
            </div>
          </div>
        </div>

        {/* Calories Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Calories Consumed</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {metrics.calories} <span className="text-sm font-normal text-slate-500">/ {metrics.calorieTarget} kcal</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${(metrics.calories / metrics.calorieTarget) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sugar Intake Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sugar Tracker</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600">
              <Candy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {metrics.sugarGrams}g <span className="text-sm font-normal text-slate-500">/ {metrics.sugarLimit}g max</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all"
                style={{ width: `${(metrics.sugarGrams / metrics.sugarLimit) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Water Hydration Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Water Intake</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {metrics.waterMl}ml <span className="text-sm font-normal text-slate-500">/ {metrics.waterTarget}ml</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full transition-all"
                style={{ width: `${(metrics.waterMl / metrics.waterTarget) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Chart & Food Diary Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Financial Cashflow</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Income vs. Expense weekly distribution</p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
              This Week
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockFinanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expenseColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="income" stroke="#4f46e5" fillOpacity={1} fill="url(#incomeColor)" />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#expenseColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Meals Quick Log */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Today's Nutrition Log</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Curated Indian & Healthy Diet</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">Idli with Sambar (3 pcs)</h4>
                    <p className="text-xs text-slate-400">Breakfast • 310 kcal</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">1.8g sugar</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">Brown Rice & Dal Tadka</h4>
                    <p className="text-xs text-slate-400">Lunch • 540 kcal</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">2.1g sugar</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">Chapati with Paneer Bhurji</h4>
                    <p className="text-xs text-slate-400">Dinner • 480 kcal</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">3.4g sugar</span>
              </div>
            </div>
          </div>

          <button className="w-full mt-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors">
            + Log New Meal
          </button>
        </div>
      </div>
    </div>
  );
}

