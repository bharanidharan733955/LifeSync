import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Bell, User, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import ThemeToggle from './ThemeToggle.jsx';
import { logoutUser } from '../store/authSlice.js';

export default function Navbar() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Signed out successfully.');
  };

  return (
    <header className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100 hidden sm:block">
          Personal Finance & Health Hub
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <button
          aria-label="Notifications"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
          <Link
            to="/profile"
            className="flex items-center gap-2 hover:opacity-85 transition-opacity"
            title="View Profile"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-medium text-sm overflow-hidden">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
              ) : user?.fullName ? (
                user.fullName[0].toUpperCase()
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden md:block">
              {user?.fullName || 'User'}
            </span>
          </Link>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
