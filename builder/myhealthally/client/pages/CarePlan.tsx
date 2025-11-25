import { Link } from "react-router-dom";
import { ChevronRight, Apple, Dumbbell, Pill, Beaker, Check, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function CarePlan() {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSection, setExpandedSection] = useState<string | null>("overview");

  const tabs = ["overview", "supplements", "nutrition", "lifestyle", "exercise", "labs"];

  const tabLabels: Record<string, string> = {
    overview: "Overview",
    supplements: "Supplements",
    nutrition: "Nutrition",
    lifestyle: "Lifestyle",
    exercise: "Exercise",
    labs: "Labs",
  };

  const sections = {
    overview: [
      {
        id: "welcome",
        title: "Your Personalized Care Plan",
        description: "This plan is customized based on your health metrics and goals",
        items: [
          "Daily hydration targets",
          "Stress management techniques",
          "Sleep optimization strategies",
          "Preventive health measures",
        ],
      },
    ],
    supplements: [
      {
        title: "Vitamin D3",
        dosage: "2000 IU daily",
        description: "Morning with breakfast",
        reason: "Low levels detected in recent labs",
        completed: false,
      },
      {
        title: "Omega-3",
        dosage: "1000mg daily",
        description: "Evening with dinner",
        reason: "Heart health support",
        completed: true,
      },
      {
        title: "Magnesium",
        dosage: "300mg daily",
        description: "Evening before bed",
        reason: "Sleep quality improvement",
        completed: false,
      },
    ],
    nutrition: [
      {
        title: "Breakfast: High-Protein",
        description: "Eggs, oatmeal, berries, greek yogurt",
        target: "Within 1 hour of waking",
        completed: true,
      },
      {
        title: "Lunch: Balanced Macros",
        description: "Lean protein, vegetables, whole grains",
        target: "12:00 PM - 1:00 PM",
        completed: false,
      },
      {
        title: "Dinner: Light & Early",
        description: "Fish or chicken, roasted vegetables",
        target: "6:00 PM - 7:00 PM",
        completed: false,
      },
    ],
    lifestyle: [
      {
        title: "Stress Management",
        description: "10-15 min meditation daily",
        target: "Morning or evening",
        completed: false,
      },
      {
        title: "Sleep Schedule",
        description: "Consistent 10 PM - 6 AM bedtime",
        target: "7-8 hours nightly",
        completed: true,
      },
      {
        title: "Screen Time",
        description: "No screens 1 hour before bed",
        target: "9:00 PM onwards",
        completed: false,
      },
    ],
    exercise: [
      {
        title: "Cardio",
        description: "Brisk walking or cycling",
        target: "3x per week, 30 mins",
        completed: true,
      },
      {
        title: "Strength Training",
        description: "Light weights or bodyweight exercises",
        target: "2x per week, 20 mins",
        completed: false,
      },
      {
        title: "Flexibility",
        description: "Yoga or stretching routine",
        target: "Daily, 10 mins",
        completed: false,
      },
    ],
    labs: [
      {
        title: "Annual Checkup",
        description: "Comprehensive metabolic panel",
        status: "Scheduled for Jan 15",
        completed: false,
      },
      {
        title: "Glucose Testing",
        description: "Fasting glucose levels",
        status: "Last tested: Dec 1",
        completed: true,
      },
    ],
  };

  const renderContent = (tab: string) => {
    const content = sections[tab as keyof typeof sections];
    if (!content) return null;

    return (
      <div className="space-y-4">
        {content.map((item: any, idx: number) => (
          <div
            key={idx}
            className="bg-white rounded-xl p-6 border border-slate-200 hover:border-teal-300 transition-colors"
          >
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                defaultChecked={item.completed}
                className="w-5 h-5 rounded border-2 border-slate-300 text-teal-500 mt-1 cursor-pointer"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 text-lg mb-1">{item.title}</h3>
                {item.description && (
                  <p className="text-slate-600 text-sm mb-2">{item.description}</p>
                )}
                {item.dosage && (
                  <p className="text-teal-600 font-medium text-sm mb-2">{item.dosage}</p>
                )}
                {item.reason && (
                  <p className="text-slate-600 text-xs italic">{item.reason}</p>
                )}
                {item.target && (
                  <p className="text-slate-600 text-sm mt-2">Target: {item.target}</p>
                )}
                {item.status && (
                  <p className="text-slate-600 text-sm mt-2">{item.status}</p>
                )}
                {tab === "overview" && item.items && (
                  <ul className="mt-4 space-y-2">
                    {item.items.map((listItem: string, listIdx: number) => (
                      <li key={listIdx} className="text-slate-700 text-sm flex items-start gap-2">
                        <span className="text-teal-500 mt-0.5">•</span>
                        <span>{listItem}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <img 
              src="https://cdn.builder.io/api/v1/image/assets%2Ff0e178cb947e448182889b581f07529d%2F9e0f1a3b796e459286bbf9636ed59102?format=webp&width=100" 
              alt="MyHealthAlly Logo" 
              className="h-8"
            />
          </Link>
          <Link to="/dashboard" className="text-teal-600 hover:text-teal-700 font-medium">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Your Personalized Care Plan</h1>
          <p className="text-lg text-slate-600">Customized wellness recommendations for your health journey</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-8">
          <div className="flex overflow-x-auto border-b border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setExpandedSection(tab);
                }}
                className={`flex-1 px-4 py-4 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {renderContent(activeTab)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-4 rounded-2xl font-semibold transition-colors">
            Report Progress
          </button>
          <button className="flex-1 border-2 border-teal-500 text-teal-600 hover:text-teal-700 py-4 rounded-2xl font-semibold transition-colors">
            Edit Plan
          </button>
        </div>

        {/* Footer Link */}
        <div className="text-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
          >
            Back to Dashboard <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
