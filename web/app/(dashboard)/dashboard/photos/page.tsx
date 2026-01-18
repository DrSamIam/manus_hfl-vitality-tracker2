'use client';

import { useState } from 'react';
import { Plus, Camera, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const photos = [
  { id: '1', date: 'Jan 15, 2026', type: 'Front', weight: '185 lbs' },
  { id: '2', date: 'Jan 15, 2026', type: 'Side', weight: '185 lbs' },
  { id: '3', date: 'Jan 15, 2026', type: 'Back', weight: '185 lbs' },
  { id: '4', date: 'Jan 1, 2026', type: 'Front', weight: '188 lbs' },
  { id: '5', date: 'Jan 1, 2026', type: 'Side', weight: '188 lbs' },
  { id: '6', date: 'Jan 1, 2026', type: 'Back', weight: '188 lbs' },
  { id: '7', date: 'Dec 15, 2025', type: 'Front', weight: '190 lbs' },
  { id: '8', date: 'Dec 15, 2025', type: 'Side', weight: '190 lbs' },
  { id: '9', date: 'Dec 15, 2025', type: 'Back', weight: '190 lbs' },
];

const dates = ['Jan 15, 2026', 'Jan 1, 2026', 'Dec 15, 2025'];

export default function PhotosPage() {
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [compareMode, setCompareMode] = useState(false);
  const [compareDate, setCompareDate] = useState(dates[2]);

  const filteredPhotos = photos.filter(p => p.date === selectedDate);
  const comparePhotos = photos.filter(p => p.date === compareDate);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progress Photos</h1>
          <p className="text-gray-600">Visual record of your transformation</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
          <Camera size={18} />
          Take Photos
        </button>
      </div>

      {/* Compare Toggle */}
      <div className="flex items-center gap-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={compareMode}
            onChange={(e) => setCompareMode(e.target.checked)}
            className="w-4 h-4 text-primary-500 rounded"
          />
          <span className="text-gray-700">Compare Mode</span>
        </label>
      </div>

      {/* Date Selector */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <label className="text-sm text-gray-500 mb-1 block">Current</label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg"
          >
            {dates.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </div>
        {compareMode && (
          <div className="flex-1">
            <label className="text-sm text-gray-500 mb-1 block">Compare to</label>
            <select
              value={compareDate}
              onChange={(e) => setCompareDate(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg"
            >
              {dates.filter(d => d !== selectedDate).map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Photos Grid */}
      {compareMode ? (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">{selectedDate}</h3>
            <div className="grid grid-cols-3 gap-3">
              {filteredPhotos.map((photo) => (
                <div key={photo.id} className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="mx-auto text-gray-400 mb-2" size={32} />
                    <span className="text-sm text-gray-500">{photo.type}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">Weight: {filteredPhotos[0]?.weight}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">{compareDate}</h3>
            <div className="grid grid-cols-3 gap-3">
              {comparePhotos.map((photo) => (
                <div key={photo.id} className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="mx-auto text-gray-400 mb-2" size={32} />
                    <span className="text-sm text-gray-500">{photo.type}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">Weight: {comparePhotos[0]?.weight}</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-3 gap-4">
            {filteredPhotos.map((photo) => (
              <div key={photo.id} className="aspect-[3/4] bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
                <div className="text-center">
                  <Camera className="mx-auto text-gray-400 mb-2" size={48} />
                  <span className="text-gray-500 font-medium">{photo.type}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 mt-4">Weight on {selectedDate}: {filteredPhotos[0]?.weight}</p>
        </div>
      )}

      {/* Timeline */}
      <div className="mt-8">
        <h3 className="font-semibold text-gray-900 mb-4">Photo Timeline</h3>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {dates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`flex-shrink-0 p-3 rounded-lg border transition-colors ${
                selectedDate === date
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Calendar size={20} className={selectedDate === date ? 'text-primary-500' : 'text-gray-400'} />
              <div className="text-sm font-medium mt-1">{date}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
