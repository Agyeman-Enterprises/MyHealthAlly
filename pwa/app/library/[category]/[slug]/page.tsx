import { getPublishedContent } from "@/lib/content/loadContent";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';

export default async function LibraryModulePage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const modules = await getPublishedContent();
  const contentModule = modules.find(
    (m) => m.category === params.category && m.slug === params.slug
  );

  if (!contentModule) {
    notFound();
  }

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
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-4">
          <Link
            href="/library"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            ← Back to Library
          </Link>
        </div>

        <Card className="p-6 mb-6">
          <div className="text-sm text-gray-500 mb-2">
            {categoryNames[contentModule.category] || contentModule.category}
          </div>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-bold text-navy-600 mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold text-navy-600 mt-6 mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-semibold text-navy-600 mt-4 mb-2">{children}</h3>,
                p: ({ children }) => <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700">{children}</ol>,
                li: ({ children }) => <li className="ml-4">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-navy-700">{children}</strong>,
                em: ({ children }) => <em className="italic text-gray-600">{children}</em>,
              }}
            >
              {contentModule.body}
            </ReactMarkdown>
          </div>
        </Card>

        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-gray-700 mb-3">
            Want a clinician to review this with you?
          </p>
          <Link
            href="/connect"
            className="inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Connect to a Care Team
          </Link>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}

