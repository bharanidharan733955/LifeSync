import React, { useEffect, useState } from 'react';
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Layers,
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

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    income: 0,
    expenses: 0,
    budgetsActive: 0,
    savingsProgress: 0,
  });
  const [cashflowData, setCashflowData] = useState([
    { name: 'Mon', income: 0, expense: 0 },
    { name: 'Tue', income: 0, expense: 0 },
    { name: 'Wed', income: 0, expense: 0 },
    { name: 'Thu', income: 0, expense: 0 },
    { name: 'Fri', income: 0, expense: 0 },
    { name: 'Sat', income: 0, expense: 0 },
    { name: 'Sun', income: 0, expense: 0 },
  ]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/transactions');
        if (res.data?.summary) {
          setMetrics({
            income: res.data.summary.totalIncome || 0,
            expenses: res.data.summary.totalExpenses || 0,
            budgetsActive: 0,
            savingsProgress: 0,
          });
        }
        if (res.data?.data && Array.isArray(res.data.data)) {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const weeklyMap = {
            Mon: { name: 'Mon', income: 0, expense: 0 },
            Tue: { name: 'Tue', income: 0, expense: 0 },
            Wed: { name: 'Wed', income: 0, expense: 0 },
            Thu: { name: 'Thu', income: 0, expense: 0 },
            Fri: { name: 'Fri', income: 0, expense: 0 },
            Sat: { name: 'Sat', income: 0, expense: 0 },
            Sun: { name: 'Sun', income: 0, expense: 0 },
          };
          res.data.data.forEach((tx) => {
            const d = new Date(tx.transactionDate || tx.createdAt);
            const dayName = days[d.getDay()];
            if (weeklyMap[dayName]) {
              const amt = Number(tx.amount) || 0;
              if (tx.type === 'INCOME') weeklyMap[dayName].income += amt;
              else if (tx.type === 'EXPENSE') weeklyMap[dayName].expense += amt;
            }
          });
          setCashflowData(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((k) => weeklyMap[k]));
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
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
            Here is your financial overview for today.
          </p>
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
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500">
              <span>Overall status</span>
            </div>
          </div>
        </div>

        {/* Income Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Income</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              ₹{metrics.income.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>This month</span>
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Expenses</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              ₹{metrics.expenses.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-rose-600">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>This month</span>
            </div>
          </div>
        </div>

        {/* Savings Rate Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Savings Rate</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {metrics.income > 0 ? Math.round(((metrics.income - metrics.expenses) / metrics.income) * 100) : 0}%
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all"
                style={{ width: `${metrics.income > 0 ? Math.min(100, ((metrics.income - metrics.expenses) / metrics.income) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Chart & Quick Actions */}
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
              <AreaChart data={cashflowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

        {/* Quick Actions Panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Quick Actions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Manage your finances</p>

            <div className="space-y-3">
              <a href="/finance" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">Add Transaction</h4>
                  <p className="text-xs text-slate-400">Record income or expense</p>
                </div>
              </a>

              <a href="/budgets" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">View Budgets</h4>
                  <p className="text-xs text-slate-400">Track spending against limits</p>
                </div>
              </a>

              <a href="/savings-goals" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">Savings Goals</h4>
                  <p className="text-xs text-slate-400">Check your progress</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
