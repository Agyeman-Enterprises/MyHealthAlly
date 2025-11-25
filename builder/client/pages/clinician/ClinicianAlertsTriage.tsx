import ClinicianLayout from "@/components/ClinicianLayout";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle, Clock, ChevronRight, Filter } from "lucide-react";
import { useState } from "react";

export default function ClinicianAlertsTriage() {
  const [filter, setFilter] = useState("all");

  const alerts = [
    {
      id: 1,
      severity: "high",
      patient: "Sarah Chen",
      issue: "Abnormal HRV - Below normal range",
      time: "2 hours ago",
      metrics: "HRV: 28ms (Normal: 40-60ms)",
      status: "pending",
    },
    {
      id: 2,
      severity: "high",
      patient: "Michael Johnson",
      issue: "Elevated Blood Pressure",
      time: "4 hours ago",
      metrics: "BP: 156/95 mmHg",
      status: "pending",
    },
    {
      id: 3,
      severity: "medium",
      patient: "Emily Rodriguez",
      issue: "Missed Medication - Lisinopril",
      time: "6 hours ago",
      metrics: "Scheduled: 8:00 AM today",
      status: "reviewed",
    },
    {
      id: 4,
      severity: "low",
      patient: "Robert Davis",
      issue: "Weight Gain - 3 lbs this week",
      time: "8 hours ago",
      metrics: "Current: 182 lbs",
      status: "pending",
    },
    {
      id: 5,
      severity: "high",
      patient: "Lisa Park",
      issue: "Lab Alert - High Glucose",
      time: "1 day ago",
      metrics: "Fasting Glucose: 156 mg/dL",
      status: "pending",
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-50 border-red-200 text-red-700";
      case "medium":
        return "bg-amber-50 border-amber-200 text-amber-700";
      default:
        return "bg-blue-50 border-blue-200 text-blue-700";
    }
  };

  const getSeverityIcon = (severity: string) => {
    return severity === "high" ? (
      <AlertTriangle className="w-5 h-5" />
    ) : (
      <Clock className="w-5 h-5" />
    );
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "pending") return alert.status === "pending";
    if (filter === "reviewed") return alert.status === "reviewed";
    return true;
  });

  return (
    <ClinicianLayout activePage="/clinician/alerts">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Alerts & Triage
          </h1>
          <p className="text-slate-600">
            Review and triage patient alerts by severity
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-600">High Severity</p>
            <p className="text-3xl font-bold text-red-600">
              {alerts.filter((a) => a.severity === "high").length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-600">Medium Severity</p>
            <p className="text-3xl font-bold text-amber-600">
              {alerts.filter((a) => a.severity === "medium").length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-600">Pending Review</p>
            <p className="text-3xl font-bold text-teal-600">
              {alerts.filter((a) => a.status === "pending").length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              filter === "all"
                ? "bg-teal-50 text-teal-600 font-medium border border-teal-200"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            All Alerts
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "pending"
                ? "bg-teal-50 text-teal-600 font-medium border border-teal-200"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("reviewed")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "reviewed"
                ? "bg-teal-50 text-teal-600 font-medium border border-teal-200"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Reviewed
          </button>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <Link
              key={alert.id}
              to={`/clinician/patient/${alert.id}`}
              className={`block p-6 rounded-xl border transition-all hover:shadow-md cursor-pointer ${getSeverityColor(
                alert.severity
              )}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {alert.patient}
                    </h3>
                    <p className="font-medium mb-2">{alert.issue}</p>
                    <p className="text-sm opacity-75 mb-2">{alert.metrics}</p>
                    <p className="text-sm opacity-60">{alert.time}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {alert.status === "pending" ? (
                    <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium">
                      Pending
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Reviewed
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-900">
              All caught up!
            </p>
            <p className="text-slate-600">
              No {filter === "pending" ? "pending" : filter === "reviewed" ? "reviewed" : ""} alerts at this time.
            </p>
          </div>
        )}
      </div>
    </ClinicianLayout>
  );
}
