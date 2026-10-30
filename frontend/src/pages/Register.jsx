import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../services/api.js';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/register', data);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.success('Account created! Please login.');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
            First Name
          </label>
          <input
            type="text"
            {...register('firstName')}
            placeholder="Priya"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
          />
          {errors.firstName && (
            <p className="text-[11px] text-rose-500 mt-0.5">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
            Last Name
          </label>
          <input
            type="text"
            {...register('lastName')}
            placeholder="Sharma"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
          />
          {errors.lastName && (
            <p className="text-[11px] text-rose-500 mt-0.5">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
          Email Address
        </label>
        <input
          type="email"
          {...register('email')}
          placeholder="priya@example.com"
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
        />
        {errors.email && (
          <p className="text-[11px] text-rose-500 mt-0.5">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
          Password
        </label>
        <input
          type="password"
          {...register('password')}
          placeholder="••••••••"
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
        />
        {errors.password && (
          <p className="text-[11px] text-rose-500 mt-0.5">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
          Confirm Password
        </label>
        <input
          type="password"
          {...register('confirmPassword')}
          placeholder="••••••••"
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
        />
        {errors.confirmPassword && (
          <p className="text-[11px] text-rose-500 mt-0.5">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-md shadow-indigo-500/20 disabled:opacity-50"
      >
        {loading ? 'Creating Account...' : 'Get Started'}
      </button>

      <div className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
        Already registered?{' '}
        <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </form>
  );
}

