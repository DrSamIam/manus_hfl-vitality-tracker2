'use client';

import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Minus, Scale } from 'lucide-react';

const measurements = [
  { id: '1', name: 'Weight', value: 185, unit: 'lbs', change: -3, date: 'Jan 18, 2026' },
  { id: '2', name: 'Body Fat', value: 18.5, unit: '%', change: -1.2, date: 'Jan 18, 2026' },
  { id: '3', name: 'Waist', value: 34, unit: 'in', change: -0.5, date: 'Jan 18, 2026' },
  { id: '4', name: 'Hips', value: 38, unit: 'in', change: 0, date: 'Jan 18, 2026' },
  { id: '5', name: 'Chest', value: 42, unit: 'in', change: 0.5, date: 'Jan 18, 2026' },
  { id: '6', name: 'Left Arm', value: 14.5, unit: 'in', change: 0.25, date: 'Jan 18, 2026' },
  { id: '7', name: 'Right Arm', value: 14.75, unit: 'in', change: 0.25, date: 'Jan 18, 2026' },
  { id: '8', name: 'Left Thigh', value: 23, unit: 'in', change: 0, date: 'Jan 18, 2026' },
  { id: '9', name: 'Right Thigh', value: 23.25, unit: 'in', change: 0.25, date: 'Jan 18, 2026' },
  { id: '10', name: 'Neck', value: 16, unit: 'in', change: 0, date: 'Jan 18, 2026' },
];

export default function MeasurementsPage() {
  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp size={16} className="text-blue-500" />;
    if (change < 0) return <TrendingDown size={16} className="text-green-500" />;
    return <Minus size={16} className="text-gray-400" />;
  };

  const getChangeColor = (name: string, change: number) => {
    // For weight and body fat, decrease is good
    if (['Weight', 'Body Fat', 'Waist'].includes(name)) {
      return change < 0 ? 'text-green-600' : change > 0 ? 'text-red-600' : 'text-gray-500';
    }
    // For muscle measurements, increase is good
    return change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Body Measurements</h1>
          <p className="text-gray-600">Track your physical progress</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
          <Plus size={18} />
          Log Measurements
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <Scale className="mb-2" size={24} />
          <div className="text-3xl font-bold">185</div>
          <div className="text-blue-100">Current Weight (lbs)</div>
          <div className="text-sm mt-1 text-blue-200">-3 lbs this month</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="text-3xl font-bold">18.5%</div>
          <div className="text-green-100">Body Fat</div>
          <div className="text-sm mt-1 text-green-200">-1.2% this month</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="text-3xl font-bold">34"</div>
          <div className="text-purple-100">Waist</div>
          <div className="text-sm mt-1 text-purple-200">-0.5" this month</div>
        </div>
      </div>

      {/* All Measurements */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">All Measurements</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {measurements.map((m) => (
            <div key={m.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getTrendIcon(m.change)}
                <div>
                  <h3 className="font-medium text-gray-900">{m.name}</h3>
                  <p className="text-xs text-gray-500">Last updated: {m.date}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">{m.value} <span className="text-sm font-normal text-gray-500">{m.unit}</span></div>
                {m.change !== 0 && (
                  <span className={`text-sm ${getChangeColor(m.name, m.change)}`}>
                    {m.change > 0 ? '+' : ''}{m.change} {m.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
