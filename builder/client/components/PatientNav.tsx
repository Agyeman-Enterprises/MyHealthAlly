import { Link } from "react-router-dom";
import {
  Heart,
  TrendingUp,
  MessageSquare,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
  Mic,
} from "lucide-react";
import { useState } from "react";

interface PatientNavProps {
  activePage?: string;
}

export default function PatientNav({ activePage }: PatientNavProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userName = "Sarah";

  const navItems = [
    { label: "Dashboard", icon: Heart, path: "/dashboard" },
    { label: "Vitals Trends", icon: TrendingUp, path: "/vitals" },
    { label: "Care Plan", icon: Zap, path: "/care-plan" },
    { label: "Messages", icon: MessageSquare, path: "/messages" },
    { label: "Voice Messages", icon: Mic, path: "/voice-messages" },
    { label: "Appointments", icon: Calendar, path: "/appointments" },
    { label: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <>
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Ff0e178cb947e448182889b581f07529d%2F9e0f1a3b796e459286bbf9636ed59102?format=webp&width=100"
              alt="MyHealthAlly Logo"
              className="h-8"
            />
            <span className="font-bold text-lg text-slate-900 hidden sm:inline">
              MyHealthAlly
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-slate-600" />
            ) : (
              <Menu className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>
      </nav>

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "block" : "hidden"
        } md:block fixed md:relative md:w-64 w-64 bg-white border-r border-slate-200 py-8 px-6 h-screen top-16 md:top-0 left-0 z-40 overflow-y-auto md:sticky md:h-[calc(100vh-64px)]`}
      >
        <div className="space-y-8">
          {/* User Profile */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <span className="text-teal-600 font-bold text-lg">S</span>
            </div>
            <div>
              <p className="font-semibold text-slate-900">{userName} Chen</p>
              <p className="text-sm text-slate-500">Patient</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activePage === item.path
                    ? "bg-teal-50 text-teal-600 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Sign Out */}
          <div className="border-t border-slate-200 pt-6">
            <button className="w-full flex items-center gap-3 text-slate-600 hover:text-slate-900 font-medium transition-colors px-4 py-3 rounded-lg hover:bg-slate-50">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
