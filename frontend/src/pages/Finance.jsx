import React, { useState, useEffect } from 'react';
import { Plus, Download, Filter, Search, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';
import api from '../services/api.js';

export default function Finance() {
  const [transactions, setTransactions] = useState([
    {
      _id: '1',
      description: 'Organic Groceries (Fresh Produce)',
      amount: 1450.00,
      type: 'expense',
      category: 'Groceries',
      paymentMethod: 'UPI',
      date: '2026-10-30',
      isFoodExpense: true,
    },
    {
      _id: '2',
      description: 'Monthly Consulting Retainer',
      amount: 65000.00,
      type: 'income',
      category: 'Salary',
      paymentMethod: 'Netbanking',
      date: '2026-10-28',
      isFoodExpense: false,
    },
    {
      _id: '3',
      description: 'Gym & Crossfit Subscription',
      amount: 2500.00,
      type: 'expense',
      category: 'Health & Fitness',
      paymentMethod: 'Card',
      date: '2026-10-25',
      isFoodExpense: false,
    },
  ]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get('/finance/transactions');
        if (res.data?.data && res.data.data.length > 0) {
          setTransactions(res.data.data);
        }
      } catch (err) {
        // Fallback to active state
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Personal Expense & Income Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track transactions, budgets, savings goals, and export tax-ready statements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search transactions by merchant, tag or description..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium flex items-center gap-1.5 border border-slate-200/50 dark:border-slate-700/50">
            <Filter className="w-4 h-4" />
            Category
          </button>
          <button className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium flex items-center gap-1.5 border border-slate-200/50 dark:border-slate-700/50">
            Payment Method
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4">Transaction</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {transactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{tx.description}</div>
                    {tx.isFoodExpense && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <Tag className="w-3 h-3" /> Food & Nutrition Linked
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{tx.category}</td>
                  <td className="py-3.5 px-4 text-slate-500">{tx.paymentMethod}</td>
                  <td className="py-3.5 px-4 text-slate-500">{tx.date}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

