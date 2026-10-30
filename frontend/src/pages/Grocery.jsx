import React, { useState } from 'react';
import { ShoppingCart, Check, Plus, Trash2 } from 'lucide-react';

export default function Grocery() {
  const [items, setItems] = useState([
    { id: '1', name: 'Fresh Paneer (Malai)', quantity: '500g', purchased: false, price: 180 },
    { id: '2', name: 'Toor Dal (Organic)', quantity: '1kg', purchased: true, price: 175 },
    { id: '3', name: 'Brown Sona Masoori Rice', quantity: '5kg', purchased: false, price: 340 },
    { id: '4', name: 'Rolled Oats', quantity: '1kg', purchased: true, price: 190 },
    { id: '5', name: 'Fresh Spinach (Palak)', quantity: '2 bunches', purchased: false, price: 40 },
  ]);

  const togglePurchased = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, purchased: !item.purchased } : item))
    );
  };

  const totalEstimated = items.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Smart Grocery & Shopping Lists
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Auto-generate shopping items from your weekly meal plan with price estimation.
          </p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Weekly Nutrition Shopping List</h3>
            <span className="text-xs text-slate-400">Generated from "South Indian Balanced High-Protein" plan</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">₹{totalEstimated}</div>
            <span className="text-[11px] text-slate-400">Estimated Total</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 mt-2">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => togglePurchased(item.id)}
              className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    item.purchased
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {item.purchased && <Check className="w-3.5 h-3.5" />}
                </div>
                <span
                  className={`text-sm font-medium ${
                    item.purchased
                      ? 'line-through text-slate-400 dark:text-slate-500'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {item.name}
                </span>
                <span className="text-xs text-slate-400">({item.quantity})</span>
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">₹{item.price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

