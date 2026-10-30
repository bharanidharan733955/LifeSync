import React from 'react';
import { Outlet } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle.jsx';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 transition-colors">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-3">
            <HeartPulse className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            LifeTrack
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Personal Finance, Nutrition & AI Wellness
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

