'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';

type Resource = {
  id: string;
  title: string;
  category: string;
  type: 'article' | 'pdf';
  duration: string;
  href: string;
  icon: string;
};

const resources: Resource[] = [
  { id: 'asthma-guide', title: 'Asthma Self-Management Guide', category: 'Respiratory', type: 'pdf', duration: '12 pages', href: '/resources/asthma-self-management-guide.md', icon: '🌬️' },
  { id: 'asthma-action', title: 'Asthma Action Plan', category: 'Respiratory', type: 'pdf', duration: '10 pages', href: '/resources/asthma-action-plan-guide.md', icon: '📝' },
  { id: 'copd-management', title: 'COPD Management Guide', category: 'Respiratory', type: 'pdf', duration: '14 pages', href: '/resources/copd-management-guide.md', icon: '💨' },
  { id: 'newborn-warning', title: 'Newborn Warning Signs', category: 'Pediatrics', type: 'pdf', duration: '8 pages', href: '/resources/newborn-warning-signs-guide.md', icon: '👶' },
];

const categories = [
  { id: 'Respiratory', name: 'Respiratory Health', icon: '🌬️' },
  { id: 'Pediatrics', name: 'Pediatric Care', icon: '👶' },
];

export default function EducationPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !activeCategory || r.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-600">Health Education</h1>
          <p className="text-gray-600">Learn about managing your health</p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-400"
          />
        </div>

        <Card className="mb-6">
          <h2 className="font-semibold text-navy-600 mb-4">Browse by Topic</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                className={`p-4 border rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all text-center ${activeCategory === cat.id ? 'border-primary-400 bg-primary-50' : ''}`}
              >
                <span className="text-2xl block mb-1">{cat.icon}</span>
                <span className="text-sm font-medium text-navy-600">{cat.name}</span>
                <span className="text-xs text-gray-500 block">
                  {resources.filter((r) => r.category === cat.id).length} resources
                </span>
              </button>
            ))}
          </div>
        </Card>

        <h2 className="font-semibold text-navy-600 mb-4">Resources</h2>
        <div className="space-y-3">
          {filtered.map((resource) => (
            <Card key={resource.id} hover className="cursor-pointer" onClick={() => router.push(resource.href)}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center text-2xl">
                  {resource.icon}
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
          {filtered.length === 0 && <p className="text-sm text-gray-500">No resources match your filters.</p>}
        </div>

        <Card className="mt-6 bg-primary-50 border-primary-200">
          <h3 className="font-semibold text-navy-600 mb-2">📚 Personalized Learning</h3>
          <p className="text-sm text-gray-600">These resources link directly to the available guides. Ask your care team for additional recommendations.</p>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
