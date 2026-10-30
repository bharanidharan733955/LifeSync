import React, { useState } from 'react';
import { Calendar, Plus, Sparkles, Check, ChevronRight } from 'lucide-react';

const mealPlans = [
  {
    id: '1',
    name: 'South Indian Balanced High-Protein',
    type: 'Weekly',
    diet: 'Vegetarian',
    cuisine: 'South Indian',
    targetCalories: 2100,
    protein: 85,
    daysCount: 7,
  },
  {
    id: '2',
    name: 'Keto Weight Loss & Low Sugar',
    type: 'Daily',
    diet: 'Non-Vegetarian',
    cuisine: 'Pan Indian',
    targetCalories: 1750,
    protein: 110,
    daysCount: 1,
  },
  {
    id: '3',
    name: 'North Indian Muscle Builder',
    type: 'Weekly',
    diet: 'Eggetarian',
    cuisine: 'North Indian',
    targetCalories: 2600,
    protein: 140,
    daysCount: 7,
  },
];

export default function DietPlanner() {
  const [activePlan, setActivePlan] = useState(mealPlans[0]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Intelligent Diet & Meal Planner
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Customizable daily & weekly meal plans respecting allergies, regional cuisine, and macros.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Generate via AI
          </button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            New Custom Plan
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mealPlans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setActivePlan(plan)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              activePlan.id === plan.id
                ? 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-500 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {plan.type} • {plan.cuisine}
              </span>
              {activePlan.id === plan.id && <Check className="w-4 h-4 text-indigo-600" />}
            </div>

            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-2">
              {plan.name}
            </h3>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <span>{plan.targetCalories} kcal / day</span>
              <span className="font-semibold text-indigo-600">{plan.protein}g protein</span>
            </div>
          </div>
        ))}
      </div>

      {/* Active Plan Detail & Meals breakdown */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Plan Schedule: {activePlan.name}
        </h3>

        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase">Breakfast (08:30 AM)</span>
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-0.5">
                3 Idlis with Coconut Chutney & Vegetable Sambar
              </h4>
            </div>
            <span className="text-xs font-semibold text-slate-500">350 kcal • 10g Protein</span>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-600 uppercase">Lunch (01:00 PM)</span>
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-0.5">
                Brown Rice, Palak Paneer, Moong Dal, Cucumber Salad
              </h4>
            </div>
            <span className="text-xs font-semibold text-slate-500">650 kcal • 28g Protein</span>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-600 uppercase">Evening Snack (05:00 PM)</span>
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-0.5">
                Roasted Makhana & Masala Buttermilk (Chaas)
              </h4>
            </div>
            <span className="text-xs font-semibold text-slate-500">140 kcal • 5g Protein</span>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-purple-600 uppercase">Dinner (08:00 PM)</span>
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-0.5">
                2 Multigrain Rotis, Soya Chunks Curry, Steamed Veggies
              </h4>
            </div>
            <span className="text-xs font-semibold text-slate-500">520 kcal • 32g Protein</span>
          </div>
        </div>
      </div>
    </div>
  );
}

