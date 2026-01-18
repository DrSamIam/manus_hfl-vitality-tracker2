'use client';

import { useState } from 'react';
import { Plus, Heart, Stethoscope, AlertCircle, Users } from 'lucide-react';

const conditions = [
  { id: '1', name: 'Type 2 Diabetes', diagnosed: '2020', status: 'Managed', notes: 'Controlled with Metformin' },
  { id: '2', name: 'Hypertension', diagnosed: '2019', status: 'Managed', notes: 'On Lisinopril 10mg' },
];

const surgeries = [
  { id: '1', name: 'Appendectomy', date: '2015', hospital: 'City General Hospital' },
  { id: '2', name: 'Knee Arthroscopy', date: '2018', hospital: 'Sports Medicine Center' },
];

const allergies = [
  { id: '1', name: 'Penicillin', severity: 'Severe', reaction: 'Anaphylaxis' },
  { id: '2', name: 'Shellfish', severity: 'Moderate', reaction: 'Hives, swelling' },
];

const familyHistory = [
  { id: '1', condition: 'Heart Disease', relation: 'Father', notes: 'Heart attack at age 55' },
  { id: '2', condition: 'Type 2 Diabetes', relation: 'Mother', notes: 'Diagnosed at age 50' },
  { id: '3', condition: 'Breast Cancer', relation: 'Maternal Grandmother', notes: 'Diagnosed at age 65' },
];

export default function MedicalHistoryPage() {
  const [activeTab, setActiveTab] = useState<'conditions' | 'surgeries' | 'allergies' | 'family'>('conditions');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical History</h1>
          <p className="text-gray-600">Your complete health background</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
          <Plus size={18} />
          Add Entry
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'conditions', label: 'Conditions', icon: Heart },
          { id: 'surgeries', label: 'Surgeries', icon: Stethoscope },
          { id: 'allergies', label: 'Allergies', icon: AlertCircle },
          { id: 'family', label: 'Family History', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200">
        {activeTab === 'conditions' && (
          <div>
            {conditions.map((condition, index) => (
              <div key={condition.id} className={`p-4 ${index !== conditions.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{condition.name}</h3>
                    <p className="text-sm text-gray-500">Diagnosed: {condition.diagnosed}</p>
                    <p className="text-sm text-gray-600 mt-1">{condition.notes}</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">{condition.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'surgeries' && (
          <div>
            {surgeries.map((surgery, index) => (
              <div key={surgery.id} className={`p-4 ${index !== surgeries.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <h3 className="font-semibold text-gray-900">{surgery.name}</h3>
                <p className="text-sm text-gray-500">{surgery.date} • {surgery.hospital}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'allergies' && (
          <div>
            {allergies.map((allergy, index) => (
              <div key={allergy.id} className={`p-4 ${index !== allergies.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{allergy.name}</h3>
                    <p className="text-sm text-gray-600">Reaction: {allergy.reaction}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    allergy.severity === 'Severe' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {allergy.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'family' && (
          <div>
            {familyHistory.map((item, index) => (
              <div key={item.id} className={`p-4 ${index !== familyHistory.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <h3 className="font-semibold text-gray-900">{item.condition}</h3>
                <p className="text-sm text-gray-500">{item.relation}</p>
                <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
