import { Link } from "react-router-dom";
import { AlertTriangle, Clock, Users, MessageSquare, Calendar, FileText, Pill, Beaker } from "lucide-react";
import { useState } from "react";

export default function ClinicianDashboard() {
  const alerts = [
    { id: 1, severity: "high", patient: "Sarah Chen", issue: "Abnormal HRV", time: "2 hours ago" },
    { id: 2, severity: "high", patient: "Michael Johnson", issue: "High BP: 145/92", time: "4 hours ago" },
    { id: 3, severity: "medium", patient: "Emily Rodriguez", issue: "Missed medication", time: "6 hours ago" },
  ];

  const appointments = [
    { patient: "Sarah Chen", time: "2:00 PM", reason: "Regular checkup", type: "Virtual" },
    { patient: "John Smith", time: "2:30 PM", reason: "Follow-up", type: "In-person" },
    { patient: "Lisa Park", time: "3:00 PM", reason: "Lab review", type: "Virtual" },
    { patient: "Robert Davis", time: "3:30 PM", reason: "Vitals check", type: "In-person" },
  ];

  const queue = [
    { patient: "Alex Turner", reason: "Acute pain", time: "9:45 AM", status: "waiting" },
    { patient: "Nina Patel", reason: "Follow-up vitals", time: "9:52 AM", status: "waiting" },
  ];

  const stats = [
    { label: "Active Patients", value: "84", icon: Users, color: "teal" },
    { label: "Today's Visits", value: "12", icon: Calendar, color: "emerald" },
    { label: "Alerts", value: alerts.length, icon: AlertTriangle, color: "red" },
    { label: "Pending Tasks", value: "7", icon: FileText, color: "amber" },
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
          <button className="text-slate-600 hover:text-slate-900 font-medium">
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Clinician Dashboard</h1>
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
          {/* Alerts */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Active Alerts</h2>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border-l-4 ${
                    alert.severity === "high"
                      ? "bg-red-50 border-l-red-500"
                      : "bg-amber-50 border-l-amber-500"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{alert.patient}</p>
                      <p className="text-sm text-slate-600 mt-1">{alert.issue}</p>
                      <p className="text-xs text-slate-500 mt-2">{alert.time}</p>
                    </div>
                    <Link
                      to="/clinician/alerts"
                      className={`px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap ${
                        alert.severity === "high"
                          ? "bg-red-200 text-red-700 hover:bg-red-300"
                          : "bg-amber-200 text-amber-700 hover:bg-amber-300"
                      }`}
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/clinician/alerts"
              className="inline-flex items-center gap-2 mt-6 text-teal-600 hover:text-teal-700 font-medium"
            >
              View All Alerts →
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-8 text-white shadow-md">
            <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/clinician/care-plan-editor"
                className="w-full bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-xl font-medium transition-colors text-left flex items-center gap-3 block"
              >
                <FileText className="w-5 h-5" />
                Create Care Plan
              </Link>
              <button className="w-full bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-xl font-medium transition-colors text-left flex items-center gap-3">
                <Beaker className="w-5 h-5" />
                Review Labs
              </button>
              <Link
                to="/clinician/patients"
                className="w-full bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-xl font-medium transition-colors text-left flex items-center gap-3 block"
              >
                <Users className="w-5 h-5" />
                View Patients
              </Link>
              <button className="w-full bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-xl font-medium transition-colors text-left flex items-center gap-3">
                <MessageSquare className="w-5 h-5" />
                Messages
              </button>
            </div>
          </div>
        </div>

        {/* Appointments & Queue */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Today's Appointments */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Today's Appointments</h2>
            <div className="space-y-3">
              {appointments.map((apt, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-900">{apt.patient}</p>
                    <p className="text-sm text-slate-600">{apt.reason} • {apt.type}</p>
                  </div>
                  <p className="font-bold text-slate-900">{apt.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visit Queue */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Visit Queue</h2>
            {queue.length > 0 ? (
              <div className="space-y-3">
                {queue.map((item, idx) => (
                  <div key={idx} className="p-4 border border-amber-200 bg-amber-50 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{item.patient}</p>
                        <p className="text-sm text-slate-600 mt-1">{item.reason}</p>
                        <div className="flex items-center gap-2 text-sm text-amber-700 mt-2">
                          <Clock className="w-4 h-4" />
                          <span>Since {item.time}</span>
                        </div>
                      </div>
                      <Link
                        to={`/clinician/virtual-visit/${idx}`}
                        className="px-4 py-2 bg-amber-200 text-amber-700 rounded-lg font-medium hover:bg-amber-300 transition-colors whitespace-nowrap"
                      >
                        Check In
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
