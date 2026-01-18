'use client';

import { useState } from 'react';
import { Plus, Moon, Sun, Clock, Star } from 'lucide-react';

const sleepLogs = [
  { id: '1', date: 'Jan 17', bedtime: '10:30 PM', wakeTime: '6:30 AM', duration: '8h 0m', quality: 4 },
  { id: '2', date: 'Jan 16', bedtime: '11:00 PM', wakeTime: '6:45 AM', duration: '7h 45m', quality: 3 },
  { id: '3', date: 'Jan 15', bedtime: '10:15 PM', wakeTime: '6:15 AM', duration: '8h 0m', quality: 5 },
  { id: '4', date: 'Jan 14', bedtime: '11:30 PM', wakeTime: '7:00 AM', duration: '7h 30m', quality: 3 },
  { id: '5', date: 'Jan 13', bedtime: '10:00 PM', wakeTime: '6:00 AM', duration: '8h 0m', quality: 4 },
  { id: '6', date: 'Jan 12', bedtime: '12:00 AM', wakeTime: '7:30 AM', duration: '7h 30m', quality: 2 },
  { id: '7', date: 'Jan 11', bedtime: '10:45 PM', wakeTime: '6:30 AM', duration: '7h 45m', quality: 4 },
];

export default function SleepPage() {
  const avgDuration = '7h 47m';
  const avgQuality = 3.6;
  const avgBedtime = '10:51 PM';

  const renderStars = (quality: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < quality ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sleep Tracking</h1>
          <p className="text-gray-600">Monitor your sleep patterns</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
          <Plus size={18} />
          Log Sleep
        </button>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
          <Clock className="mb-2" size={24} />
          <div className="text-2xl font-bold">{avgDuration}</div>
          <div className="text-indigo-200 text-sm">Avg Duration</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 text-white">
          <Star className="mb-2" size={24} />
          <div className="text-2xl font-bold">{avgQuality.toFixed(1)}/5</div>
          <div className="text-amber-200 text-sm">Avg Quality</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 text-white">
          <Moon className="mb-2" size={24} />
          <div className="text-2xl font-bold">{avgBedtime}</div>
          <div className="text-blue-200 text-sm">Avg Bedtime</div>
        </div>
      </div>

      {/* Last Night */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Last Night</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <Moon className="mx-auto text-indigo-500 mb-1" size={24} />
              <div className="text-sm text-gray-500">Bedtime</div>
              <div className="font-semibold text-gray-900">{sleepLogs[0].bedtime}</div>
            </div>
            <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-amber-500 rounded-full" />
            <div className="text-center">
              <Sun className="mx-auto text-amber-500 mb-1" size={24} />
              <div className="text-sm text-gray-500">Wake Time</div>
              <div className="font-semibold text-gray-900">{sleepLogs[0].wakeTime}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{sleepLogs[0].duration}</div>
            <div className="flex gap-0.5 justify-end mt-1">
              {renderStars(sleepLogs[0].quality)}
            </div>
          </div>
        </div>
      </div>

      {/* Sleep History */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Sleep History</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {sleepLogs.map((log) => (
            <div key={log.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{log.date}</div>
                <div className="text-sm text-gray-500">{log.bedtime} → {log.wakeTime}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{log.duration}</div>
                <div className="flex gap-0.5 justify-end">
                  {renderStars(log.quality)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
