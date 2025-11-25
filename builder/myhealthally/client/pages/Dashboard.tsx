import { Link } from "react-router-dom";
import {
  Heart,
  Zap,
  TrendingUp,
  MessageSquare,
  Calendar,
  ChevronRight,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userName = "Sarah";

  const vitals = [
    { label: "Heart Rate", value: "72", unit: "bpm", trend: "-2%", icon: Heart, color: "teal" },
    { label: "HRV", value: "45", unit: "ms", trend: "+5%", icon: Zap, color: "emerald" },
    { label: "Blood Pressure", value: "120/80", unit: "mmHg", trend: "stable", icon: TrendingUp, color: "teal" },
    { label: "Weight", value: "165", unit: "lbs", trend: "-1%", icon: TrendingUp, color: "slate" },
    { label: "Glucose", value: "95", unit: "mg/dL", trend: "-3%", icon: Heart, color: "teal" },
  ];

  const tasks = [
    { title: "Take Morning Supplement", completed: true },
    { title: "Log Lunch", completed: false },
    { title: "30 min Walk", completed: false },
    { title: "Evening Hydration Check", completed: false },
  ];

  const messages = [
    { from: "Dr. James Wilson", preview: "Your recent labs look great...", unread: true },
    { from: "Care Coordinator", preview: "Reminder: Appointment tomorrow at 2pm", unread: false },
  ];

  const appointments = [
    { date: "Tomorrow", time: "2:00 PM", provider: "Dr. James Wilson", type: "Virtual" },
  ];

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
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors hidden md:block">
              <Settings className="w-5 h-5 text-slate-600" />
            </button>
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
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? "block" : "hidden"} md:block w-64 bg-white border-r border-slate-200 py-8 px-6 h-screen sticky top-16 overflow-y-auto`}>
          <div className="space-y-8">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                <span className="text-teal-600 font-bold text-lg">S</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">{userName} Chen</p>
                <p className="text-sm text-slate-500">Patient</p>
              </div>
            </div>

            <nav className="space-y-2">
              <NavLink to="/dashboard" icon={Heart} label="Dashboard" active />
              <NavLink to="/vitals" icon={TrendingUp} label="Vitals Trends" />
              <NavLink to="/care-plan" icon={Zap} label="Care Plan" />
              <NavLink to="/messages" icon={MessageSquare} label="Messages" />
              <NavLink to="/appointments" icon={Calendar} label="Appointments" />
            </nav>

            <div className="border-t border-slate-200 pt-6">
              <button className="w-full flex items-center gap-3 text-slate-600 hover:text-slate-900 font-medium transition-colors">
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome back, {userName}</h1>
              <p className="text-lg text-slate-600">Your health data is updating in real time</p>
            </div>

            {/* Vitals Grid */}
            <div className="grid md:grid-cols-5 gap-4 mb-8">
              {vitals.map((vital, idx) => {
                const Icon = vital.icon;
                const isTeal = vital.color === "teal";
                const isEmerald = vital.color === "emerald";
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-teal-300 transition-colors shadow-sm"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                      isTeal ? "bg-teal-100" : isEmerald ? "bg-emerald-100" : "bg-slate-100"
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        isTeal ? "text-teal-600" : isEmerald ? "text-emerald-600" : "text-slate-600"
                      }`} />
                    </div>
                    <p className="text-sm text-slate-600 mb-1">{vital.label}</p>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-3xl font-bold text-slate-900">{vital.value}</span>
                      <span className="text-sm text-slate-500">{vital.unit}</span>
                    </div>
                    <p className={`text-xs font-medium ${
                      vital.trend === "stable" ? "text-slate-600" : vital.trend.startsWith("+") ? "text-emerald-600" : "text-teal-600"
                    }`}>
                      {vital.trend} {vital.trend !== "stable" ? "vs. last week" : ""}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Main Cards Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Recent Trends */}
              <div className="md:col-span-2 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Trends</h2>
                <div className="space-y-4">
                  {[
                    { label: "Heart Rate", change: "-2%", status: "Improving" },
                    { label: "HRV", change: "+5%", status: "Great" },
                    { label: "Sleep Score", change: "+8%", status: "Excellent" },
                    { label: "Activity", change: "+3%", status: "Good" },
                  ].map((trend, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                      <span className="text-slate-700">{trend.label}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-teal-600 font-semibold">{trend.change}</span>
                        <span className="text-sm text-slate-500 bg-teal-50 px-3 py-1 rounded-lg">{trend.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/vitals" className="mt-6 inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium">
                  View Full Trends <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Care Plan Summary */}
              <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-8 text-white shadow-md">
                <h2 className="text-xl font-bold mb-4">Your Care Plan</h2>
                <p className="text-teal-100 mb-6">Personalized wellness program designed for you</p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-sm">Nutrition Guidelines</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-sm">Exercise Plan</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-sm">Supplement Schedule</span>
                  </div>
                </div>
                <Link to="/care-plan" className="inline-block bg-white hover:bg-slate-50 text-teal-600 px-4 py-2 rounded-xl font-medium transition-colors">
                  View Plan
                </Link>
              </div>
            </div>

            {/* Bottom Cards Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Today's Tasks */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Today's Tasks</h2>
                <div className="space-y-3">
                  {tasks.map((task, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={task.completed}
                        className="w-5 h-5 rounded border-2 border-slate-300 text-teal-500 focus:ring-teal-500 cursor-pointer"
                      />
                      <span className={task.completed ? "line-through text-slate-400" : "text-slate-700"}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Messages</h2>
                <div className="space-y-3">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      msg.unread ? "bg-teal-50 border border-teal-200" : "bg-slate-50"
                    } hover:bg-slate-100`}>
                      <p className={msg.unread ? "font-bold text-slate-900" : "font-medium text-slate-700"}>
                        {msg.from}
                      </p>
                      <p className="text-sm text-slate-600 truncate">{msg.preview}</p>
                    </div>
                  ))}
                </div>
                <Link to="/messages" className="mt-4 inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Next Appointment */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Next Visit</h2>
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((apt, idx) => (
                      <div key={idx} className="p-4 bg-teal-50 rounded-xl border border-teal-200">
                        <p className="text-sm text-slate-600">{apt.date}</p>
                        <p className="text-lg font-bold text-slate-900">{apt.time}</p>
                        <p className="text-sm text-slate-700 mt-2">{apt.provider}</p>
                        <p className="text-xs text-slate-500 mt-1">{apt.type} Visit</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600 mb-4">No upcoming appointments</p>
                )}
                <Link to="/appointments" className="mt-4 inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium">
                  Schedule Visit <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavLink({ to, icon: Icon, label, active }: any) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
        active
          ? "bg-teal-50 text-teal-600 font-semibold border border-teal-200"
          : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
}
