'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, TrendingUp, MessageSquare, User, Calendar } from 'lucide-react';

const navItems = [
  { path: '/patient/dashboard', icon: Home, label: 'Home' },
  { path: '/patient/analytics', icon: TrendingUp, label: 'Trends' },
  { path: '/patient/messages', icon: MessageSquare, label: 'Messages' },
  { path: '/patient/schedule', icon: Calendar, label: 'Schedule' },
  { path: '/patient/profile', icon: User, label: 'Profile' },
];

export default function FloatingNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-myh-surface border-t border-myh-border shadow-lg shadow-slate-200/80 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-around py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-myh-primary'
                  : 'text-myh-textSoft hover:text-myh-text'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

