import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <span className="font-semibold text-xl text-gray-900">Vitality Tracker</span>
        </div>
        <Link 
          href="/dashboard"
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Get Started
        </Link>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Your Complete Health, Fitness & Longevity Diary
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Track symptoms, biomarkers, supplements, medications, workouts, nutrition, and more. 
            Get AI-powered insights from Dr. Sam to optimize your health journey.
          </p>
          <Link 
            href="/dashboard"
            className="inline-block px-8 py-4 bg-primary-500 text-white text-lg font-semibold rounded-xl hover:bg-primary-600 transition-colors shadow-lg hover:shadow-xl"
          >
            Start Tracking Now
          </Link>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon="💬"
            title="Dr. Sam AI"
            description="Get personalized health coaching from your AI health assistant"
          />
          <FeatureCard 
            icon="📊"
            title="Track Everything"
            description="Symptoms, labs, supplements, medications, workouts, and nutrition"
          />
          <FeatureCard 
            icon="🔬"
            title="Smart Insights"
            description="AI-powered analysis of your health trends and patterns"
          />
          <FeatureCard 
            icon="💊"
            title="HFL Products"
            description="Personalized supplement recommendations based on your data"
          />
          <FeatureCard 
            icon="🏋️"
            title="Workout Templates"
            description="Pre-built routines tailored to your fitness goals"
          />
          <FeatureCard 
            icon="📱"
            title="Complete Diary"
            description="Your entire health history in one secure place"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500">
          <p>© 2025 Health Fitness Longevity. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
