'use client';

import { useState } from 'react';
import { Camera, Plus, Utensils } from 'lucide-react';

interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

export default function DietPage() {
  const [entries, setEntries] = useState<FoodEntry[]>([
    { id: '1', name: 'Scrambled Eggs with Avocado', calories: 450, protein: 25, carbs: 12, fat: 35, time: '8:30 AM' },
    { id: '2', name: 'Grilled Chicken Salad', calories: 380, protein: 42, carbs: 18, fat: 15, time: '12:30 PM' },
  ]);

  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);
  const totalProtein = entries.reduce((sum, e) => sum + e.protein, 0);
  const totalCarbs = entries.reduce((sum, e) => sum + e.carbs, 0);
  const totalFat = entries.reduce((sum, e) => sum + e.fat, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Diet & Nutrition</h1>
          <p className="text-gray-600">Track your meals and macros</p>
        </div>
      </div>

      {/* Daily Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MacroCard label="Calories" value={totalCalories} goal={2200} unit="kcal" color="bg-orange-500" />
        <MacroCard label="Protein" value={totalProtein} goal={150} unit="g" color="bg-red-500" />
        <MacroCard label="Carbs" value={totalCarbs} goal={200} unit="g" color="bg-blue-500" />
        <MacroCard label="Fat" value={totalFat} goal={80} unit="g" color="bg-yellow-500" />
      </div>

      {/* Add Food Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button className="flex items-center justify-center gap-3 p-4 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-colors">
          <Camera size={24} />
          <span className="font-medium">Scan Food Photo</span>
        </button>
        <button className="flex items-center justify-center gap-3 p-4 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors">
          <Plus size={24} />
          <span className="font-medium">Add Manually</span>
        </button>
      </div>

      {/* Food Log */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Food Log</h2>
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Utensils className="text-primary-500" size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{entry.name}</h3>
                    <p className="text-sm text-gray-500">{entry.time}</p>
                  </div>
                  <span className="font-bold text-gray-900">{entry.calories} kcal</span>
                </div>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-red-600">P: {entry.protein}g</span>
                  <span className="text-blue-600">C: {entry.carbs}g</span>
                  <span className="text-yellow-600">F: {entry.fat}g</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MacroCard({ label, value, goal, unit, color }: {
  label: string;
  value: number;
  goal: number;
  unit: string;
  color: string;
}) {
  const percentage = Math.min((value / goal) * 100, 100);
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}<span className="text-sm font-normal text-gray-500"> {unit}</span></div>
      <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }} />
      </div>
      <div className="text-xs text-gray-400 mt-1">Goal: {goal} {unit}</div>
    </div>
  );
}
