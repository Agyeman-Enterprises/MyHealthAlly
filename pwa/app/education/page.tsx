'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';

const categories = [
  { id: 'diabetes', name: 'Diabetes Management', icon: '🩸', count: 8 },
  { id: 'nutrition', name: 'Nutrition & Diet', icon: '🥗', count: 12 },
  { id: 'exercise', name: 'Exercise & Fitness', icon: '🏃', count: 6 },
  { id: 'heart', name: 'Heart Health', icon: '❤️', count: 5 },
  { id: 'stress', name: 'Stress Management', icon: '🧘', count: 4 },
  { id: 'sleep', name: 'Sleep Health', icon: '😴', count: 3 },
];

const featuredResources = [
  { id: '1', title: 'Understanding Your A1C Results', category: 'Diabetes', type: 'article', duration: '5 min read', image: '📊' },
  { id: '2', title: 'Healthy Eating on a Budget', category: 'Nutrition', type: 'video', duration: '12 min', image: '🎬' },
  { id: '3', title: 'Managing Blood Sugar with Exercise', category: 'Exercise', type: 'article', duration: '8 min read', image: '📝' },
  { id: '4', title: 'Pacific Island Heart-Healthy Recipes', category: 'Nutrition', type: 'pdf', duration: '15 pages', image: '📄' },
];

export default function EducationPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-600">Health Education</h1>
          <p className="text-gray-600">Learn about managing your health</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-400"
          />
        </div>

        {/* Categories */}
        <Card className="mb-6">
          <h2 className="font-semibold text-navy-600 mb-4">Browse by Topic</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => alert(`Browse ${cat.name}`)} className="p-4 border rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all text-center">
                <span className="text-2xl block mb-1">{cat.icon}</span>
                <span className="text-sm font-medium text-navy-600">{cat.name}</span>
                <span className="text-xs text-gray-500 block">{cat.count} resources</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Featured Resources */}
        <h2 className="font-semibold text-navy-600 mb-4">Recommended for You</h2>
        <div className="space-y-3">
          {featuredResources.map((resource) => (
            <Card key={resource.id} hover className="cursor-pointer" onClick={() => alert(`Open: ${resource.title}`)}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center text-2xl">
                  {resource.image}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-navy-600">{resource.title}</h3>
                  <p className="text-sm text-gray-500">{resource.category} • {resource.type} • {resource.duration}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-6 bg-primary-50 border-primary-200">
          <h3 className="font-semibold text-navy-600 mb-2">📚 Personalized Learning</h3>
          <p className="text-sm text-gray-600">These resources are recommended based on your care plan and health conditions. Ask your care team for additional recommendations.</p>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
