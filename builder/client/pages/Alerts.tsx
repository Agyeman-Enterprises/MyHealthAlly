import { Link } from "react-router-dom";
import { AlertTriangle, AlertCircle, Bell, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";

export default function Alerts() {
  const [filter, setFilter] = useState("all");

  const allAlerts = [
    {
      id: 1,
      type: "critical",
      patient: "Sarah Chen",
      issue: "Abnormal HRV Reading",
      description: "HRV dropped to 25 ms (25% below baseline)",
      timestamp: "2 hours ago",
      action: "Review Labs",
      patientLink: "/patient/1",
    },
    {
      id: 2,
      type: "critical",
      patient: "Michael Johnson",
      issue: "High Blood Pressure",
      description: "BP 145/92 mmHg - exceeds threshold",
      timestamp: "4 hours ago",
      action: "Contact Patient",
      patientLink: "/patient/2",
    },
    {
      id: 3,
      type: "warning",
      patient: "Emily Rodriguez",
      issue: "Missed Medication",
      description: "Vitamin D supplement not logged for 3 days",
      timestamp: "6 hours ago",
      action: "Send Reminder",
      patientLink: "/patient/3",
    },
    {
      id: 4,
      type: "warning",
      patient: "David Wong",
      issue: "Lab Results Pending",
      description: "Glucose testing results available for review",
      timestamp: "8 hours ago",
      action: "Review Results",
      patientLink: "/patient/4",
    },
    {
      id: 5,
      type: "info",
      patient: "Lisa Park",
      issue: "Care Plan Update",
      description: "Patient completed milestone in exercise routine",
      timestamp: "10 hours ago",
      action: "View Details",
      patientLink: "/patient/5",
    },
  ];

  const visitRequests = [
    {
      id: 1,
      patient: "John Smith",
      reason: "Follow-up consultation",
      requestedFor: "ASAP",
      type: "Virtual",
      priority: "high",
    },
    {
      id: 2,
      patient: "Michelle Chen",
      reason: "Lab review",
      requestedFor: "This week",
      type: "In-Person",
      priority: "medium",
    },
    {
      id: 3,
      patient: "Robert Davis",
      reason: "Medication adjustment",
      requestedFor: "Next week",
      type: "Virtual",
      priority: "low",
    },
  ];

  const walkinQueue = [
    { id: 1, patient: "Alex Turner", arrivedAt: "9:45 AM", chief: "Acute pain" },
    { id: 2, patient: "Nina Patel", arrivedAt: "9:52 AM", chief: "Follow-up vitals" },
  ];

  const filteredAlerts =
    filter === "all"
      ? allAlerts
      : allAlerts.filter((alert) => alert.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case "critical":
        return AlertTriangle;
      case "warning":
        return AlertCircle;
      default:
        return Bell;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "critical":
        return { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-700" };
      case "warning":
        return { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700" };
      default:
        return { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700" };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/staff" className="flex items-center gap-3">
            <img 
              src="https://cdn.builder.io/api/v1/image/assets%2Ff0e178cb947e448182889b581f07529d%2F9e0f1a3b796e459286bbf9636ed59102?format=webp&width=100" 
              alt="MyHealthAlly Logo" 
              className="h-8"
            />
          </Link>
          <Link to="/staff" className="text-teal-600 hover:text-teal-700 font-medium">
            Back to Staff Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Alerts & Triage</h1>
          <p className="text-lg text-slate-600">Patient monitoring and visit requests</p>
        </div>

        {/* Alerts Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Patient Alerts</h2>
            <div className="flex gap-2">
              {["all", "critical", "warning", "info"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === f
                      ? "bg-teal-500 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredAlerts.map((alert) => {
              const Icon = getIcon(alert.type);
              const colors = getColor(alert.type);
              return (
                <div
                  key={alert.id}
                  className={`${colors.bg} border ${colors.border} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg flex-shrink-0 ${colors.badge.replace("text-", "").split(" ")[0]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg">{alert.patient}</h3>
                          <p className="text-sm font-semibold text-slate-700 mt-1">{alert.issue}</p>
                          <p className="text-sm text-slate-600 mt-2">{alert.description}</p>
                          <p className="text-xs text-slate-500 mt-3">{alert.timestamp}</p>
                        </div>
                        <Link
                          to={alert.patientLink}
                          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                            alert.type === "critical"
                              ? "bg-red-200 text-red-700 hover:bg-red-300"
                              : alert.type === "warning"
                              ? "bg-amber-200 text-amber-700 hover:bg-amber-300"
                              : "bg-blue-200 text-blue-700 hover:bg-blue-300"
                          }`}
                        >
                          {alert.action}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Visit Requests */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Visit Requests</h2>
            <div className="space-y-4">
              {visitRequests.map((request) => (
                <div key={request.id} className="p-4 border border-slate-200 rounded-xl hover:border-teal-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900">{request.patient}</h3>
                      <p className="text-sm text-slate-600">{request.reason}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      request.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : request.priority === "medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                      {request.type} • {request.requestedFor}
                    </p>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-teal-100 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-200 transition-colors">
                        Assign
                      </button>
                      <button className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                        Defer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Walk-in Queue */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Walk-in Queue</h2>
            {walkinQueue.length > 0 ? (
              <div className="space-y-4">
                {walkinQueue.map((patient) => (
                  <div key={patient.id} className="p-4 border border-amber-200 bg-amber-50 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900">{patient.patient}</h3>
                        <p className="text-sm text-slate-600 mt-1">Chief: {patient.chief}</p>
                        <div className="flex items-center gap-2 text-sm text-amber-700 mt-2">
                          <Clock className="w-4 h-4" />
                          <span>Arrived {patient.arrivedAt}</span>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-amber-200 text-amber-700 rounded-lg font-medium hover:bg-amber-300 transition-colors whitespace-nowrap">
                        Check In
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <p className="text-slate-600">No walk-ins currently waiting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
