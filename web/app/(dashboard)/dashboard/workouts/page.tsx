'use client';

import { useState } from 'react';
import { Play, Plus, Clock, Flame, Dumbbell } from 'lucide-react';

const templates = [
  { id: '1', name: 'Morning Energy Boost', duration: '15 min', type: 'Bodyweight', difficulty: 'Easy' },
  { id: '2', name: 'Fat Burning Circuit', duration: '25 min', type: 'HIIT', difficulty: 'Medium' },
  { id: '3', name: 'Strength Foundation', duration: '45 min', type: 'Strength', difficulty: 'Medium' },
  { id: '4', name: 'Stress Relief Flow', duration: '20 min', type: 'Yoga', difficulty: 'Easy' },
  { id: '5', name: 'Upper Body Power', duration: '40 min', type: 'Strength', difficulty: 'Hard' },
  { id: '6', name: 'Core Crusher', duration: '20 min', type: 'Core', difficulty: 'Medium' },
];

const recentWorkouts = [
  { id: '1', name: 'Strength Foundation', date: 'Yesterday', duration: '48 min', calories: 320 },
  { id: '2', name: 'Morning Energy Boost', date: '2 days ago', duration: '15 min', calories: 120 },
  { id: '3', name: 'Fat Burning Circuit', date: '4 days ago', duration: '28 min', calories: 280 },
];

export default function WorkoutsPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'history'>('templates');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workouts</h1>
          <p className="text-gray-600">Start a workout or view your history</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
          <Plus size={18} />
          Custom Workout
        </button>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <Dumbbell className="mx-auto text-primary-500 mb-2" size={24} />
          <div className="text-2xl font-bold text-gray-900">3</div>
          <div className="text-sm text-gray-500">Workouts This Week</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <Clock className="mx-auto text-blue-500 mb-2" size={24} />
          <div className="text-2xl font-bold text-gray-900">91 min</div>
          <div className="text-sm text-gray-500">Total Duration</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <Flame className="mx-auto text-orange-500 mb-2" size={24} />
          <div className="text-2xl font-bold text-gray-900">720</div>
          <div className="text-sm text-gray-500">Calories Burned</div>
        </div>
      </div>

      {/* AI Recommendation */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🤖</div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Dr. Sam's Recommendation</h3>
            <p className="text-primary-100">Based on your energy levels (8/10) and good sleep last night, today is a great day for strength training. Try the "Upper Body Power" workout!</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'templates' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'history' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          History
        </button>
      </div>

      {/* Content */}
      {activeTab === 'templates' ? (
        <div className="grid md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-500">{template.type} • {template.duration}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  template.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                  template.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {template.difficulty}
                </span>
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors">
                <Play size={18} />
                Start Workout
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200">
          {recentWorkouts.map((workout, index) => (
            <div key={workout.id} className={`p-4 flex items-center gap-4 ${index !== recentWorkouts.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Dumbbell className="text-primary-500" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{workout.name}</h3>
                <p className="text-sm text-gray-500">{workout.date}</p>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">{workout.duration}</div>
                <div className="text-sm text-gray-500">{workout.calories} kcal</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
