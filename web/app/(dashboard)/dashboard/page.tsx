'use client';

import Link from 'next/link';
import { Heart, Dumbbell, Droplets, Moon, Pill, FlaskConical } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
      <p className="text-gray-600 mb-8">Here's your health overview for today</p>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard icon={<Heart className="text-red-500" />} label="Energy" value="8/10" />
        <StatCard icon={<Moon className="text-indigo-500" />} label="Sleep" value="7.5h" />
        <StatCard icon={<Droplets className="text-blue-500" />} label="Water" value="6/8" />
        <StatCard icon={<Dumbbell className="text-orange-500" />} label="Workouts" value="3" />
        <StatCard icon={<Pill className="text-green-500" />} label="Supps" value="80%" />
        <StatCard icon={<FlaskConical className="text-purple-500" />} label="Labs" value="12" />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <QuickActionCard 
          href="/dashboard/symptoms"
          title="Log Today's Symptoms"
          description="Track your energy, mood, sleep quality, and more"
          color="bg-red-50 hover:bg-red-100"
          iconColor="text-red-500"
        />
        <QuickActionCard 
          href="/dashboard/chat"
          title="Chat with Dr. Sam"
          description="Get AI-powered health insights and recommendations"
          color="bg-primary-50 hover:bg-primary-100"
          iconColor="text-primary-500"
        />
        <QuickActionCard 
          href="/dashboard/workouts"
          title="Start a Workout"
          description="Choose from templates or log a custom workout"
          color="bg-orange-50 hover:bg-orange-100"
          iconColor="text-orange-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <ActivityItem 
            icon="💊"
            title="Supplements logged"
            time="2 hours ago"
            description="Morning stack completed"
          />
          <ActivityItem 
            icon="🏋️"
            title="Workout completed"
            time="Yesterday"
            description="Strength Foundation - 45 min"
          />
          <ActivityItem 
            icon="📊"
            title="Symptoms tracked"
            time="Yesterday"
            description="Energy: 8, Mood: 7, Sleep: 8"
          />
          <ActivityItem 
            icon="🔬"
            title="Lab results added"
            time="3 days ago"
            description="Testosterone, Vitamin D, B12"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

function QuickActionCard({ href, title, description, color, iconColor }: {
  href: string;
  title: string;
  description: string;
  color: string;
  iconColor: string;
}) {
  return (
    <Link href={href} className={`block p-6 rounded-xl transition-colors ${color}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </Link>
  );
}

function ActivityItem({ icon, title, time, description }: {
  icon: string;
  title: string;
  time: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="text-2xl">{icon}</div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-gray-900">{title}</h4>
          <span className="text-sm text-gray-500">{time}</span>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
