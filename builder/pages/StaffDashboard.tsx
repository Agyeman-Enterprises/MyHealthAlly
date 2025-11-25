import { Link } from "react-router-dom";
import { AlertCircle, Clock, Users, CheckCircle, MessageSquare, Calendar, TrendingUp, Activity } from "lucide-react";
import { useState } from "react";

export default function StaffDashboard() {
  const [activeAlert, setActiveAlert] = useState<string | null>(null);

  const alerts = [
    {
      id: 1,
      severity: "high",
      patient: "Sarah Chen",
      issue: "Abnormal HRV reading",
      value: "25 ms (below normal)",
      timestamp: "2 hours ago",
      action: "Review Labs",
    },
    {
      id: 2,
      severity: "high",
      patient: "Michael Johnson",
      issue: "Blood Pressure Alert",
      value: "145/92 mmHg",
      timestamp: "4 hours ago",
      action: "Contact Patient",
    },
    {
      id: 3,
      severity: "medium",
      patient: "Emily Rodriguez",
      issue: "Missed Medication",
      value: "Vitamin D supplement",
      timestamp: "6 hours ago",
      action: "Send Reminder",
    },
  ];

  const upcomingAppointments = [
    { patient: "Sarah Chen", time: "2:00 PM", provider: "Dr. Wilson", type: "Virtual" },
    { patient: "John Smith", time: "2:30 PM", provider: "Dr. Wilson", type: "In-Person" },
    { patient: "Lisa Park", time: "3:00 PM", provider: "MA Sarah", type: "Virtual" },
    { patient: "Robert Davis", time: "3:30 PM", provider: "Dr. Chen", type: "In-Person" },
  ];

  const patients = [
    {
      id: 1,
      name: "Sarah Chen",
      status: "Active",
      lastVisit: "Dec 8, 2023",
      nextVisit: "Tomorrow 2:00 PM",
      alerts: 1,
    },
    {
      id: 2,
      name: "Michael Johnson",
      status: "Active",
      lastVisit: "Dec 1, 2023",
      nextVisit: "Jan 15, 2024",
      alerts: 1,
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      status: "Active",
      lastVisit: "Nov 28, 2023",
      nextVisit: "Jan 20, 2024",
      alerts: 1,
    },
    {
      id: 4,
      name: "John Smith",
      status: "Active",
      lastVisit: "Dec 15, 2023",
      nextVisit: "Tomorrow 2:30 PM",
      alerts: 0,
    },
  ];

  const stats = [
    { label: "Active Patients", value: "84", icon: Users, color: "teal" },
    { label: "Today's Appointments", value: "12", icon: Calendar, color: "emerald" },
    { label: "Pending Reviews", value: "7", icon: Clock, color: "amber" },
    { label: "Alerts", value: "3", icon: AlertCircle, color: "red" },
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
            <span className="font-bold text-lg text-slate-900">Clinical Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-600 hover:text-slate-900 font-medium">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Clinical Dashboard</h1>
          <p className="text-lg text-slate-600">Patient monitoring and care management</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const colorClass = {
              teal: "bg-teal-100 text-teal-600",
              emerald: "bg-emerald-100 text-emerald-600",
              amber: "bg-amber-100 text-amber-600",
              red: "bg-red-100 text-red-600",
            }[stat.color] || "bg-slate-100 text-slate-600";

            return (
              <div key={stat.label} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClass}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Alerts & Triage */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Active Alerts</h2>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => setActiveAlert(alert.id.toString())}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    alert.severity === "high"
                      ? "bg-red-50 border-l-4 border-red-500 hover:bg-red-100"
                      : "bg-amber-50 border-l-4 border-amber-500 hover:bg-amber-100"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{alert.patient}</p>
                      <p className="text-sm text-slate-700 mt-1">{alert.issue}</p>
                      <p className={`text-sm font-medium mt-1 ${
                        alert.severity === "high" ? "text-red-600" : "text-amber-600"
                      }`}>
                        {alert.value}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">{alert.timestamp}</p>
                    </div>
                    <button className={`px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap ml-4 ${
                      alert.severity === "high"
                        ? "bg-red-200 text-red-700 hover:bg-red-300"
                        : "bg-amber-200 text-amber-700 hover:bg-amber-300"
                    }`}>
                      {alert.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/alerts"
              className="inline-flex items-center gap-2 mt-6 text-teal-600 hover:text-teal-700 font-medium"
            >
              View All Alerts →
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-8 text-white shadow-md">
            <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-xl font-medium transition-colors text-left flex items-center gap-3">
                <CheckCircle className="w-5 h-5" />
                Create Care Plan
              </button>
              <button className="w-full bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-xl font-medium transition-colors text-left flex items-center gap-3">
                <TrendingUp className="w-5 h-5" />
                Review Labs
              </button>
              <button className="w-full bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-xl font-medium transition-colors text-left flex items-center gap-3">
                <MessageSquare className="w-5 h-5" />
                Message Patient
              </button>
              <button className="w-full bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-xl font-medium transition-colors text-left flex items-center gap-3">
                <Activity className="w-5 h-5" />
                Manage Visits
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Today's Appointments</h2>
            <div className="space-y-3">
              {upcomingAppointments.map((apt, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-900">{apt.patient}</p>
                    <p className="text-sm text-slate-600">{apt.provider} • {apt.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{apt.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Patient List Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Patient Summary</h2>
            <div className="space-y-2">
              {patients.slice(0, 4).map((patient) => (
                <div key={patient.id} className="text-sm p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                  <p className="font-medium text-slate-900">{patient.name}</p>
                  <p className="text-xs text-slate-600">Next: {patient.nextVisit}</p>
                  {patient.alerts > 0 && (
                    <p className="text-xs text-red-600 font-medium mt-1">{patient.alerts} alert</p>
                  )}
                </div>
              ))}
            </div>
            <Link
              to="/patients"
              className="inline-flex items-center gap-2 mt-6 text-teal-600 hover:text-teal-700 font-medium text-sm"
            >
              View All Patients →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
