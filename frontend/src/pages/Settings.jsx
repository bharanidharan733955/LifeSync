import React, { useState } from 'react';
import { User, Shield, Bell, Moon, Sun, Lock } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../store/themeSlice.js';

export default function Settings() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);

  const [aiConsent, setAiConsent] = useState({
    nutrition: true,
    finance: false,
    combined: false,
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Settings & Preferences
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your account profile, theme, data privacy, and AI synchronization consents.
        </p>
      </div>

      <div className="space-y-4">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" />
            Profile Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Full Name</label>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                {user ? `${user.firstName || 'User'} ${user.lastName || ''}` : 'Priya Sharma'}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Email</label>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                {user?.email || 'priya@example.com'}
              </div>
            </div>
          </div>
        </div>

        {/* AI & Data Privacy Consent */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-500" />
            AI & Data Privacy Consents
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Financial analytics and nutrition logs are never shared with AI without explicit user consent.
          </p>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <div>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">AI Diet & Nutrition Analysis</span>
                <p className="text-xs text-slate-400">Allows AI to analyze meal diary logs and suggest healthy alternatives.</p>
              </div>
              <input
                type="checkbox"
                checked={aiConsent.nutrition}
                onChange={(e) => setAiConsent({ ...aiConsent, nutrition: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <div>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">AI Financial Insights</span>
                <p className="text-xs text-slate-400">Allows AI to identify unusual expenses and savings recommendations.</p>
              </div>
              <input
                type="checkbox"
                checked={aiConsent.finance}
                onChange={(e) => setAiConsent({ ...aiConsent, finance: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <div>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Combined Finance & Nutrition Insights</span>
                <p className="text-xs text-slate-400">Correlates food expenditure with healthy dining patterns.</p>
              </div>
              <input
                type="checkbox"
                checked={aiConsent.combined}
                onChange={(e) => setAiConsent({ ...aiConsent, combined: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>

        {/* Appearance Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              Appearance & Theme
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Switch between light and dark visual themes</p>
          </div>
          <button
            onClick={() => dispatch(toggleTheme())}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>
    </div>
  );
}

