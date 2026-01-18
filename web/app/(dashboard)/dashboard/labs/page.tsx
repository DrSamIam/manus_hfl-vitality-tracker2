'use client';

import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Minus, FlaskConical } from 'lucide-react';

const biomarkers = [
  { id: '1', name: 'Total Testosterone', value: 650, unit: 'ng/dL', range: '300-1000', status: 'normal', trend: 'up', date: 'Jan 15, 2026' },
  { id: '2', name: 'Free Testosterone', value: 18.5, unit: 'pg/mL', range: '9-30', status: 'normal', trend: 'up', date: 'Jan 15, 2026' },
  { id: '3', name: 'Vitamin D', value: 45, unit: 'ng/mL', range: '30-100', status: 'normal', trend: 'stable', date: 'Jan 15, 2026' },
  { id: '4', name: 'Vitamin B12', value: 850, unit: 'pg/mL', range: '200-900', status: 'normal', trend: 'stable', date: 'Jan 15, 2026' },
  { id: '5', name: 'TSH', value: 2.1, unit: 'mIU/L', range: '0.4-4.0', status: 'normal', trend: 'stable', date: 'Jan 15, 2026' },
  { id: '6', name: 'Fasting Glucose', value: 95, unit: 'mg/dL', range: '70-100', status: 'normal', trend: 'down', date: 'Jan 15, 2026' },
  { id: '7', name: 'HbA1c', value: 5.4, unit: '%', range: '4.0-5.6', status: 'normal', trend: 'stable', date: 'Jan 15, 2026' },
  { id: '8', name: 'LDL Cholesterol', value: 125, unit: 'mg/dL', range: '<100', status: 'high', trend: 'down', date: 'Jan 15, 2026' },
];

export default function LabsPage() {
  const [filter, setFilter] = useState<'all' | 'normal' | 'high' | 'low'>('all');

  const filteredBiomarkers = biomarkers.filter(b => 
    filter === 'all' || b.status === filter
  );

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp size={16} className="text-green-500" />;
    if (trend === 'down') return <TrendingDown size={16} className="text-red-500" />;
    return <Minus size={16} className="text-gray-400" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'normal') return 'bg-green-100 text-green-700';
    if (status === 'high') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Labs & Biomarkers</h1>
          <p className="text-gray-600">Track your lab results over time</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
          <Plus size={18} />
          Add Results
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{biomarkers.filter(b => b.status === 'normal').length}</div>
          <div className="text-sm text-green-700">In Range</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-red-600">{biomarkers.filter(b => b.status === 'high').length}</div>
          <div className="text-sm text-red-700">High</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-600">{biomarkers.filter(b => b.status === 'low').length}</div>
          <div className="text-sm text-yellow-700">Low</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'normal', 'high', 'low'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
              filter === f ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Biomarkers List */}
      <div className="bg-white rounded-xl border border-gray-200">
        {filteredBiomarkers.map((biomarker, index) => (
          <div key={biomarker.id} className={`p-4 ${index !== filteredBiomarkers.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FlaskConical className="text-purple-500" size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">{biomarker.name}</h3>
                  {getTrendIcon(biomarker.trend)}
                </div>
                <p className="text-sm text-gray-500">Range: {biomarker.range} {biomarker.unit}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">{biomarker.value} <span className="text-sm font-normal text-gray-500">{biomarker.unit}</span></div>
                <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getStatusColor(biomarker.status)}`}>
                  {biomarker.status}
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-2 ml-14">Last updated: {biomarker.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
