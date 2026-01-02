import { getPublishedContent } from "@/lib/content/loadContent";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card } from "@/components/ui/Card";

export default async function LibraryPage() {
  const modules = await getPublishedContent();

  const modulesByCategory = modules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    const categoryArray = acc[module.category];
    if (categoryArray) {
      categoryArray.push(module);
    }
    return acc;
  }, {} as Record<string, typeof modules>);

  const categoryNames: Record<string, string> = {
    "health-navigation": "Health Navigation",
    "nutrition": "Nutrition",
    "movement": "Movement",
    "lifestyle": "Lifestyle",
    "concierge": "Concierge Care",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-navy-600 mb-2">Health Library</h1>
        <p className="text-gray-600 mb-6">
          Educational resources for health navigation and wellness. This content is for educational purposes only and is not medical advice.
        </p>

        {Object.entries(modulesByCategory).map(([category, categoryModules]) => (
          <Card key={category} className="mb-6">
            <h2 className="text-lg font-semibold text-navy-600 mb-4">
              {categoryNames[category] || category}
            </h2>
            <div className="space-y-3">
              {categoryModules.map((module) => (
                <Link
                  key={`${module.category}/${module.slug}`}
                  href={`/library/${module.category}/${module.slug}`}
                  className="block border-b border-gray-200 pb-3 last:border-b-0 last:pb-0 hover:bg-gray-50 p-3 -m-3 rounded transition-colors"
                >
                  <div className="text-sm text-gray-500 mb-1">{categoryNames[category] || category}</div>
                  <div className="text-lg font-medium text-navy-700">{module.title}</div>
                </Link>
              ))}
            </div>
          </Card>
        ))}

        {modules.length === 0 && (
          <Card>
            <p className="text-gray-500 text-center py-8">No content available at this time.</p>
          </Card>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

