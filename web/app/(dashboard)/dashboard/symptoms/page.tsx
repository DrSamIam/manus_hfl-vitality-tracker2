'use client';

import { useState } from 'react';
import { Save, TrendingUp, Calendar } from 'lucide-react';

const symptoms = [
  { id: 'energy', label: 'Energy', emoji: '⚡' },
  { id: 'mood', label: 'Mood', emoji: '😊' },
  { id: 'sleep', label: 'Sleep Quality', emoji: '😴' },
  { id: 'clarity', label: 'Mental Clarity', emoji: '🧠' },
  { id: 'libido', label: 'Libido', emoji: '❤️' },
  { id: 'performance', label: 'Performance', emoji: '💪' },
];

export default function SymptomsPage() {
  const [values, setValues] = useState<Record<string, number>>({
    energy: 7,
    mood: 7,
    sleep: 7,
    clarity: 7,
    libido: 7,
    performance: 7,
  });
  const [notes, setNotes] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleSave = () => {
    // Save to API
    alert('Symptoms saved successfully!');
  };

  const getScoreColor = (value: number) => {
    if (value >= 8) return 'text-green-500';
    if (value >= 6) return 'text-yellow-500';
    if (value >= 4) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Symptoms</h1>
          <p className="text-gray-600">Track how you're feeling today</p>
        </div>
        <button
          onClick={() => setShowAnalysis(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
        >
          <TrendingUp size={18} />
          Analyze Trends
        </button>
      </div>

      {/* Date selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-3">
          <Calendar size={20} className="text-gray-500" />
          <span className="font-medium text-gray-900">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Symptom sliders */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Rate Your Symptoms</h2>
        <div className="space-y-8">
          {symptoms.map((symptom) => (
            <div key={symptom.id}>
              <div className="flex justify-between items-center mb-2">
                <label className="flex items-center gap-2 font-medium text-gray-700">
                  <span className="text-xl">{symptom.emoji}</span>
                  {symptom.label}
                </label>
                <span className={`text-2xl font-bold ${getScoreColor(values[symptom.id])}`}>
                  {values[symptom.id]}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={values[symptom.id]}
                onChange={(e) => setValues({ ...values, [symptom.id]: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes about how you're feeling today..."
          className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className="w-full py-4 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
      >
        <Save size={20} />
        Save Today's Log
      </button>

      {/* Weekly averages */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">7-Day Averages</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {symptoms.map((symptom) => (
            <div key={symptom.id} className="text-center">
              <div className="text-2xl mb-1">{symptom.emoji}</div>
              <div className="text-xl font-bold text-gray-900">7.2</div>
              <div className="text-xs text-gray-500">{symptom.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
