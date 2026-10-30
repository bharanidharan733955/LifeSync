import React, { useState } from 'react';
import { Candy, AlertTriangle, CheckCircle2, Info, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const weeklySugarData = [
  { day: 'Mon', natural: 18, added: 12 },
  { day: 'Tue', natural: 22, added: 16 },
  { day: 'Wed', natural: 15, added: 8 },
  { day: 'Thu', natural: 20, added: 24 },
  { day: 'Fri', natural: 14, added: 15 },
  { day: 'Sat', natural: 25, added: 30 },
  { day: 'Sun', natural: 19, added: 10 },
];

export default function SugarTracker() {
  const [dailyGoal] = useState({ maxTotal: 40, maxAdded: 25 });
  const [consumedToday] = useState({ natural: 14.5, added: 12.0 });

  const totalConsumed = consumedToday.natural + consumedToday.added;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Sugar Intake & Glycemic Management
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Precision separation of naturally occurring sugars vs. harmful added sugars from packaged goods and beverages.
        </p>
      </div>

      {/* Formula & Policy Alert */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/50 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
          <strong className="font-semibold">Deterministic Calculation Formula:</strong> Sugar consumed = (Sugar per 100g × Consumed quantity / 100). Unknown added sugars are explicitly isolated and never classified as natural sugar.
        </div>
      </div>

      {/* Dual Ring Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Sugar Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Sugar (Natural + Added)</span>
            <Candy className="w-5 h-5 text-rose-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{totalConsumed}g</span>
            <span className="text-sm text-slate-400">/ {dailyGoal.maxTotal}g daily target</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full mt-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                totalConsumed > dailyGoal.maxTotal ? 'bg-rose-600' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (totalConsumed / dailyGoal.maxTotal) * 100)}%` }}
            />
          </div>
        </div>

        {/* Added Sugar Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Added Sugars (Processed & Sodas)</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{consumedToday.added}g</span>
            <span className="text-sm text-slate-400">/ {dailyGoal.maxAdded}g AHA limit</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (consumedToday.added / dailyGoal.maxAdded) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Weekly Breakdown Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Weekly Sugar Distribution</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Stacked view of Naturally occurring vs. Added sugars (grams)</p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklySugarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip />
              <Bar dataKey="natural" stackId="a" fill="#10b981" name="Naturally Occurring" radius={[0, 0, 4, 4]} />
              <Bar dataKey="added" stackId="a" fill="#f43f5e" name="Added Sugar" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

