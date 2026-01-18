'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, MessageCircle, Heart, Utensils, Dumbbell, FlaskConical,
  Pill, Stethoscope, Droplets, Moon, Ruler, Camera, FileText,
  ShoppingBag, Lightbulb, User, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/chat', icon: MessageCircle, label: 'Dr. Sam AI' },
  { href: '/dashboard/symptoms', icon: Heart, label: 'Symptoms' },
  { href: '/dashboard/diet', icon: Utensils, label: 'Diet' },
  { href: '/dashboard/workouts', icon: Dumbbell, label: 'Workouts' },
  { href: '/dashboard/labs', icon: FlaskConical, label: 'Labs' },
  { href: '/dashboard/supplements', icon: Pill, label: 'Supplements' },
  { href: '/dashboard/medications', icon: Stethoscope, label: 'Medications' },
  { href: '/dashboard/hydration', icon: Droplets, label: 'Hydration' },
  { href: '/dashboard/sleep', icon: Moon, label: 'Sleep' },
  { href: '/dashboard/body', icon: Ruler, label: 'Body' },
  { href: '/dashboard/photos', icon: Camera, label: 'Photos' },
  { href: '/dashboard/medical-history', icon: FileText, label: 'Medical' },
  { href: '/dashboard/products', icon: ShoppingBag, label: 'Shop' },
  { href: '/dashboard/insights', icon: Lightbulb, label: 'Insights' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center px-4 z-50">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="ml-3 font-semibold text-gray-900">Vitality Tracker</span>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50
        transform transition-transform duration-200 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">V</span>
            </div>
            <span className="font-semibold text-gray-900">Vitality Tracker</span>
          </Link>
        </div>
        
        <nav className="p-2 overflow-y-auto h-[calc(100vh-65px)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors
                  ${isActive 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
