'use client';

import { useState } from 'react';
import { User, Mail, Calendar, Download, Settings, LogOut, Shield, Bell } from 'lucide-react';

export default function ProfilePage() {
  const [user] = useState({
    name: 'John Smith',
    email: 'john.smith@example.com',
    memberSince: 'January 2026',
    sex: 'Male',
    birthDate: 'March 15, 1985',
    height: '5\'10"',
    activityLevel: 'Moderately Active',
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="text-primary-500" size={40} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-500">{user.email}</p>
            <p className="text-sm text-gray-400">Member since {user.memberSince}</p>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">Sex</label>
            <p className="font-medium text-gray-900">{user.sex}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Birth Date</label>
            <p className="font-medium text-gray-900">{user.birthDate}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Height</label>
            <p className="font-medium text-gray-900">{user.height}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Activity Level</label>
            <p className="font-medium text-gray-900">{user.activityLevel}</p>
          </div>
        </div>
        <button className="mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm">
          Edit Profile →
        </button>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <button className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100">
          <Bell className="text-gray-400" size={20} />
          <span className="flex-1 text-left font-medium text-gray-900">Notifications</span>
          <span className="text-gray-400">→</span>
        </button>
        <button className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100">
          <Shield className="text-gray-400" size={20} />
          <span className="flex-1 text-left font-medium text-gray-900">Privacy & Security</span>
          <span className="text-gray-400">→</span>
        </button>
        <button className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
          <Settings className="text-gray-400" size={20} />
          <span className="flex-1 text-left font-medium text-gray-900">App Settings</span>
          <span className="text-gray-400">→</span>
        </button>
      </div>

      {/* Data Export */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">Export Your Data</h3>
        <p className="text-sm text-gray-600 mb-4">Download all your health data in a comprehensive report</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
          <Download size={18} />
          Export Health Report
        </button>
      </div>

      {/* Logout */}
      <button className="w-full p-4 bg-red-50 text-red-600 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
        <LogOut size={20} />
        Sign Out
      </button>
    </div>
  );
}
