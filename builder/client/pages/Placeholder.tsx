import { Link } from "react-router-dom";
import { ChevronRight, ArrowRight } from "lucide-react";

interface PlaceholderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export default function Placeholder({ 
  title = "Coming Soon", 
  description = "This page is being built. Let me know what you'd like here!",
  icon = <ChevronRight className="w-16 h-16" />
}: PlaceholderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://cdn.builder.io/api/v1/image/assets%2Ff0e178cb947e448182889b581f07529d%2F9e0f1a3b796e459286bbf9636ed59102?format=webp&width=100" 
              alt="MyHealthAlly Logo" 
              className="h-8"
            />
            <span className="font-bold text-lg text-slate-900 hidden sm:inline">MyHealthAlly</span>
          </div>
          <Link to="/dashboard" className="text-teal-600 hover:text-teal-700 font-medium">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="space-y-6">
          <div className="flex justify-center text-slate-300 mb-4">
            {icon}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
            {title}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {description}
          </p>
          <div className="pt-8">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-2xl font-semibold transition-colors"
            >
              Return to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-16 bg-white rounded-2xl p-8 border border-slate-200 max-w-2xl mx-auto">
          <p className="text-slate-600 mb-4">
            💡 <span className="font-medium">Want to build this page?</span>
          </p>
          <p className="text-slate-600">
            Just ask me to create the {title} page and describe what you'd like it to include. I can build fully functional pages with the MyHealthAlly design system.
          </p>
        </div>
      </div>
    </div>
  );
}
