'use client';

import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Lightbulb, BarChart3 } from 'lucide-react';

const insights = [
  {
    id: '1',
    type: 'positive',
    title: 'Energy Levels Improving',
    description: 'Your average energy score has increased by 15% over the past 2 weeks. Keep up the good work with your sleep schedule!',
    metric: '+15%',
    icon: TrendingUp,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Sleep Quality Declining',
    description: 'Your sleep quality has dropped 20% this week. Consider reducing screen time before bed and maintaining a consistent bedtime.',
    metric: '-20%',
    icon: TrendingDown,
  },
  {
    id: '3',
    type: 'positive',
    title: 'Workout Consistency',
    description: 'You\'ve completed 12 workouts this month, exceeding your goal of 10. Your strength is improving!',
    metric: '120%',
    icon: CheckCircle,
  },
  {
    id: '4',
    type: 'alert',
    title: 'Hydration Below Target',
    description: 'You\'re averaging only 5 glasses of water per day. Aim for 8 glasses to support your energy and metabolism.',
    metric: '62%',
    icon: AlertTriangle,
  },
];

const recommendations = [
  {
    id: '1',
    title: 'Optimize Your Morning Routine',
    description: 'Based on your data, you perform best when you exercise in the morning. Try scheduling workouts before 9 AM.',
    product: 'Energy Surge',
  },
  {
    id: '2',
    title: 'Support Your Sleep',
    description: 'Your cortisol patterns suggest elevated evening stress. Consider adding adaptogens to your evening routine.',
    product: 'Sleep Optimizer',
  },
  {
    id: '3',
    title: 'Boost Testosterone Naturally',
    description: 'Your testosterone levels are in the lower-normal range. Strength training and specific supplements can help.',
    product: 'Testosterone Booster Pro',
  },
];

export default function InsightsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Health Insights</h1>
        <p className="text-gray-600">AI-powered analysis of your health data</p>
      </div>

      {/* Overall Health Score */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Overall Health Score</h3>
            <p className="text-primary-100">Based on all your tracked metrics</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">78</div>
            <div className="text-primary-200 text-sm">out of 100</div>
          </div>
        </div>
        <div className="mt-4 h-3 bg-primary-400/30 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full" style={{ width: '78%' }} />
        </div>
      </div>

      {/* Trend Insights */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <BarChart3 size={20} />
        Trend Analysis
      </h2>
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {insights.map((insight) => {
          const Icon = insight.icon;
          const colors = {
            positive: 'border-green-200 bg-green-50',
            warning: 'border-yellow-200 bg-yellow-50',
            alert: 'border-red-200 bg-red-50',
          };
          const iconColors = {
            positive: 'text-green-500',
            warning: 'text-yellow-500',
            alert: 'text-red-500',
          };
          
          return (
            <div key={insight.id} className={`rounded-xl border p-4 ${colors[insight.type as keyof typeof colors]}`}>
              <div className="flex items-start gap-3">
                <Icon className={iconColors[insight.type as keyof typeof iconColors]} size={24} />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                    <span className={`font-bold ${insight.type === 'positive' ? 'text-green-600' : insight.type === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                      {insight.metric}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Personalized Recommendations */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Lightbulb size={20} />
        Personalized Recommendations
      </h2>
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div key={rec.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{rec.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Suggested product: <span className="text-primary-600 font-medium">{rec.product}</span></span>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Learn More →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
