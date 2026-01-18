'use client';

import { useState } from 'react';
import { Plus, Clock, AlertCircle, Check, Pill } from 'lucide-react';

const medications = [
  { id: '1', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', time: '8:00 AM, 8:00 PM', reason: 'Blood sugar control', prescriber: 'Dr. Johnson', taken: true },
  { id: '2', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', time: '8:00 AM', reason: 'Blood pressure', prescriber: 'Dr. Johnson', taken: true },
  { id: '3', name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', time: '9:00 PM', reason: 'Cholesterol', prescriber: 'Dr. Smith', taken: false },
];

export default function MedicationsPage() {
  const [meds, setMeds] = useState(medications);

  const toggleTaken = (id: string) => {
    setMeds(meds.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medications</h1>
          <p className="text-gray-600">Track your prescriptions and adherence</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
          <Plus size={18} />
          Add Medication
        </button>
      </div>

      {/* Reminder Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="font-medium text-amber-800">Evening Reminder</h3>
          <p className="text-sm text-amber-700">Don't forget to take Atorvastatin at 9:00 PM</p>
        </div>
      </div>

      {/* Adherence Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-primary-600">95%</div>
          <div className="text-sm text-gray-500">Weekly Adherence</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{meds.length}</div>
          <div className="text-sm text-gray-500">Active Medications</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-green-600">2</div>
          <div className="text-sm text-gray-500">Taken Today</div>
        </div>
      </div>

      {/* Medications List */}
      <div className="space-y-4">
        {meds.map((med) => (
          <div key={med.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start gap-4">
              <button 
                onClick={() => toggleTaken(med.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  med.taken ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                {med.taken ? <Check size={20} /> : <Pill size={20} />}
              </button>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-semibold text-lg ${med.taken ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{med.name}</h3>
                    <p className="text-gray-600">{med.dosage} • {med.frequency}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    <Clock size={14} />
                    {med.time}
                  </div>
                </div>
                <div className="mt-3 flex gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Reason:</span>
                    <span className="ml-1 text-gray-700">{med.reason}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Prescriber:</span>
                    <span className="ml-1 text-gray-700">{med.prescriber}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
