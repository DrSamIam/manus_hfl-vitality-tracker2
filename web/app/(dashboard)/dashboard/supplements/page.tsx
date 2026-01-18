'use client';

import { useState } from 'react';
import { Plus, Scan, Check, Clock, Pill } from 'lucide-react';

const supplements = [
  { id: '1', name: 'Vitamin D3', dosage: '5000 IU', frequency: 'Daily', time: 'Morning', taken: true },
  { id: '2', name: 'Omega-3 Fish Oil', dosage: '2000mg', frequency: 'Daily', time: 'With meals', taken: true },
  { id: '3', name: 'Magnesium Glycinate', dosage: '400mg', frequency: 'Daily', time: 'Evening', taken: false },
  { id: '4', name: 'Zinc', dosage: '30mg', frequency: 'Daily', time: 'Morning', taken: true },
  { id: '5', name: 'Ashwagandha', dosage: '600mg', frequency: 'Daily', time: 'Morning', taken: false },
  { id: '6', name: 'Creatine', dosage: '5g', frequency: 'Daily', time: 'Post-workout', taken: true },
];

export default function SupplementsPage() {
  const [supps, setSupps] = useState(supplements);
  
  const takenCount = supps.filter(s => s.taken).length;
  const totalCount = supps.length;
  const percentage = Math.round((takenCount / totalCount) * 100);

  const toggleTaken = (id: string) => {
    setSupps(supps.map(s => s.id === id ? { ...s, taken: !s.taken } : s));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supplements</h1>
          <p className="text-gray-600">Track your daily supplement intake</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Scan size={18} />
            Scan Barcode
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
            <Plus size={18} />
            Add
          </button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Today's Progress</h3>
            <p className="text-green-100">{takenCount} of {totalCount} supplements taken</p>
          </div>
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle cx="40" cy="40" r="35" stroke="rgba(255,255,255,0.3)" strokeWidth="6" fill="none" />
              <circle 
                cx="40" cy="40" r="35" 
                stroke="white" strokeWidth="6" fill="none"
                strokeDasharray={`${percentage * 2.2} 220`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold">{percentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Supplements List */}
      <div className="bg-white rounded-xl border border-gray-200">
        {supps.map((supp, index) => (
          <div key={supp.id} className={`p-4 flex items-center gap-4 ${index !== supps.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <button 
              onClick={() => toggleTaken(supp.id)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                supp.taken ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
            >
              {supp.taken ? <Check size={20} /> : <Pill size={20} />}
            </button>
            <div className="flex-1">
              <h3 className={`font-medium ${supp.taken ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{supp.name}</h3>
              <p className="text-sm text-gray-500">{supp.dosage} • {supp.frequency}</p>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock size={14} />
              {supp.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
