import React, { useState } from 'react';
import { Search, Plus, Barcode, Flame, AlertCircle } from 'lucide-react';

const curatedIndianFoods = [
  { id: '1', name: 'Steamed Idli (Rice & Urad Dal)', calories: 65, protein: 2.1, carbs: 12.8, sugar: 0.2, category: 'Breakfast' },
  { id: '2', name: 'Plain Masala Dosa', calories: 210, protein: 4.5, carbs: 29.0, sugar: 1.1, category: 'Breakfast' },
  { id: '3', name: 'Toor Dal Sambar with Vegetables', calories: 130, protein: 6.2, carbs: 18.5, sugar: 2.8, category: 'Curry' },
  { id: '4', name: 'Ven Pongal (Ghee & Moong Dal)', calories: 245, protein: 5.8, carbs: 36.2, sugar: 0.4, category: 'Breakfast' },
  { id: '5', name: 'Curd Rice with Mustard Tempering', calories: 190, protein: 4.8, carbs: 28.0, sugar: 2.3, category: 'Lunch' },
  { id: '6', name: 'Paneer Butter Masala', calories: 340, protein: 12.5, carbs: 11.0, sugar: 4.8, category: 'Dinner' },
  { id: '7', name: 'Whole Wheat Chapati (1 pc)', calories: 104, protein: 3.1, carbs: 18.4, sugar: 0.3, category: 'Bread' },
];

export default function Nutrition() {
  const [search, setSearch] = useState('');

  const filteredFoods = curatedIndianFoods.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Diet & Nutrition Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Log Indian dishes, packaged foods via barcode scanner, and track macronutrients.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5">
            <Barcode className="w-4 h-4" />
            Barcode Scan
          </button>
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            Custom Food
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Indian meals (Idli, Dosa, Dal, Paneer, Biryani, Chapati)..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 shadow-sm"
        />
      </div>

      {/* Food Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFoods.map((food) => (
          <div
            key={food.id}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-emerald-500/50 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  {food.category}
                </span>
                <span className="text-xs font-medium text-slate-400">Per 100g</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-2">
                {food.name}
              </h3>

              <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-xs text-slate-400">Calories</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{food.calories}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-xs text-slate-400">Protein</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{food.protein}g</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-xs text-slate-400">Carbs</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{food.carbs}g</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-xs text-slate-400">Sugar</div>
                  <div className="text-sm font-bold text-rose-600 dark:text-rose-400">{food.sugar}g</div>
                </div>
              </div>
            </div>

            <button className="w-full mt-4 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl transition-colors">
              + Log to Diary
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

