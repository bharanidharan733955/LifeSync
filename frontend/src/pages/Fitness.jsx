import React, { useState } from 'react';
import { Droplet, Dumbbell, Scale, Plus, Trophy } from 'lucide-react';

export default function Fitness() {
  const [waterCups, setWaterCups] = useState(7);
  const targetCups = 10;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Fitness, Hydration & Body Weight
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor your water log, log aerobic/anaerobic workouts, and track BMI & body composition.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hydration Tracker */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-sky-500" />
              Daily Water Intake
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950/60">
              {waterCups * 250} / {targetCups * 250} ml
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 my-6">
            {Array.from({ length: targetCups }).map((_, i) => (
              <button
                key={i}
                onClick={() => setWaterCups(i + 1)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  i < waterCups
                    ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                <Droplet className="w-4 h-4" />
                <span className="text-[10px] mt-1 font-bold">{i + 1}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setWaterCups((c) => Math.min(targetCups, c + 1))}
            className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs rounded-xl transition-colors shadow-sm"
          >
            + Quick Add 250ml Glass
          </button>
        </div>

        {/* Body Weight & BMI */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-500" />
                Body Weight & BMI
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold">
                Normal
              </span>
            </div>

            <div className="my-6">
              <div className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">
                71.4 <span className="text-sm font-normal text-slate-500">kg</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Calculated BMI: 22.8 (Healthy Weight Range)</p>
            </div>
          </div>

          <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs rounded-xl transition-colors">
            + Log New Weight
          </button>
        </div>

        {/* Workout Activity */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-rose-500" />
                Physical Activity
              </h3>
              <span className="text-xs text-slate-400">Today</span>
            </div>

            <div className="space-y-3 my-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">Morning Hatha Yoga</h4>
                  <p className="text-[11px] text-slate-400">30 mins • Low intensity</p>
                </div>
                <span className="text-xs font-bold text-rose-600">-120 kcal</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">Brisk Evening Walk</h4>
                  <p className="text-[11px] text-slate-400">45 mins • 4.2 km</p>
                </div>
                <span className="text-xs font-bold text-rose-600">-210 kcal</span>
              </div>
            </div>
          </div>

          <button className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-medium text-xs rounded-xl transition-colors">
            + Log Workout Session
          </button>
        </div>
      </div>
    </div>
  );
}

