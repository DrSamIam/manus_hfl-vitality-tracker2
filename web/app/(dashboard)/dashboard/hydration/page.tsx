'use client';

import { useState } from 'react';
import { Plus, Droplets, Target, TrendingUp } from 'lucide-react';

const quickAddOptions = [
  { amount: 8, label: '8 oz', icon: '🥛' },
  { amount: 12, label: '12 oz', icon: '🥤' },
  { amount: 16, label: '16 oz', icon: '🍶' },
  { amount: 24, label: '24 oz', icon: '🫗' },
];

const weeklyData = [
  { day: 'Mon', amount: 72, goal: 64 },
  { day: 'Tue', amount: 80, goal: 64 },
  { day: 'Wed', amount: 56, goal: 64 },
  { day: 'Thu', amount: 64, goal: 64 },
  { day: 'Fri', amount: 48, goal: 64 },
  { day: 'Sat', amount: 72, goal: 64 },
  { day: 'Sun', amount: 40, goal: 64 },
];

export default function HydrationPage() {
  const [todayAmount, setTodayAmount] = useState(48);
  const goal = 64; // oz
  const percentage = Math.min((todayAmount / goal) * 100, 100);

  const addWater = (amount: number) => {
    setTodayAmount(prev => prev + amount);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hydration</h1>
          <p className="text-gray-600">Track your daily water intake</p>
        </div>
      </div>

      {/* Today's Progress */}
      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Today's Progress</h3>
            <div className="text-4xl font-bold">{todayAmount} oz</div>
            <p className="text-blue-100">Goal: {goal} oz</p>
          </div>
          <div className="relative w-32 h-32">
            {/* Water drop shape */}
            <svg viewBox="0 0 100 120" className="w-full h-full">
              <defs>
                <clipPath id="dropClip">
                  <path d="M50 0 C20 40, 0 70, 0 85 C0 105, 22 120, 50 120 C78 120, 100 105, 100 85 C100 70, 80 40, 50 0" />
                </clipPath>
              </defs>
              {/* Background */}
              <path 
                d="M50 0 C20 40, 0 70, 0 85 C0 105, 22 120, 50 120 C78 120, 100 105, 100 85 C100 70, 80 40, 50 0" 
                fill="rgba(255,255,255,0.2)"
              />
              {/* Fill */}
              <rect 
                x="0" 
                y={120 - (percentage * 1.2)} 
                width="100" 
                height={percentage * 1.2} 
                fill="white"
                clipPath="url(#dropClip)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">{Math.round(percentage)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Add</h3>
        <div className="grid grid-cols-4 gap-4">
          {quickAddOptions.map((option) => (
            <button
              key={option.amount}
              onClick={() => addWater(option.amount)}
              className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <span className="text-2xl">{option.icon}</span>
              <span className="font-medium text-blue-700">{option.label}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            type="number"
            placeholder="Custom amount (oz)"
            className="flex-1 p-2 border border-gray-200 rounded-lg"
          />
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Add
          </button>
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">This Week</h3>
        <div className="flex items-end justify-between gap-2 h-40">
          {weeklyData.map((day) => {
            const height = (day.amount / 100) * 100;
            const metGoal = day.amount >= day.goal;
            return (
              <div key={day.day} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center">
                  <span className="text-xs text-gray-500 mb-1">{day.amount}oz</span>
                  <div 
                    className={`w-full rounded-t-lg ${metGoal ? 'bg-blue-500' : 'bg-blue-200'}`}
                    style={{ height: `${height}px` }}
                  />
                </div>
                <span className="text-xs text-gray-600 mt-2">{day.day}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span className="text-gray-600">Goal met</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-200 rounded" />
            <span className="text-gray-600">Below goal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
