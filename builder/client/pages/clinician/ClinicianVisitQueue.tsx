import ClinicianLayout from "@/components/ClinicianLayout";
import { Link } from "react-router-dom";
import { Clock, Video, MapPin, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function ClinicianVisitQueue() {
  const [activeTab, setActiveTab] = useState("queue");

  const queue = [
    {
      id: 1,
      patient: "Alex Turner",
      reason: "Acute knee pain",
      waitTime: "15 mins",
      priority: "high",
      avatar: "AT",
      requestTime: "9:45 AM",
    },
    {
      id: 2,
      patient: "Nina Patel",
      reason: "Follow-up vitals check",
      waitTime: "28 mins",
      priority: "medium",
      avatar: "NP",
      requestTime: "9:32 AM",
    },
    {
      id: 3,
      patient: "James Wilson",
      reason: "Medication refill",
      waitTime: "42 mins",
      priority: "low",
      avatar: "JW",
      requestTime: "9:18 AM",
    },
  ];

  const scheduled = [
    {
      id: 1,
      patient: "Sarah Chen",
      time: "2:00 PM",
      type: "Virtual",
      reason: "Regular checkup",
      duration: "30 mins",
      avatar: "SC",
    },
    {
      id: 2,
      patient: "John Smith",
      time: "2:30 PM",
      type: "In-person",
      reason: "Follow-up",
      duration: "20 mins",
      avatar: "JS",
    },
    {
      id: 3,
      patient: "Lisa Park",
      time: "3:00 PM",
      type: "Virtual",
      reason: "Lab review",
      duration: "15 mins",
      avatar: "LP",
    },
    {
      id: 4,
      patient: "Robert Davis",
      time: "3:30 PM",
      type: "In-person",
      reason: "Vitals check",
      duration: "25 mins",
      avatar: "RD",
    },
  ];

  return (
    <ClinicianLayout activePage="/clinician/visits">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Visit Queue & Requests
          </h1>
          <p className="text-slate-600">
            Manage patient visit requests and today's schedule
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("queue")}
            className={`px-4 py-4 font-medium border-b-2 transition-colors ${
              activeTab === "queue"
                ? "border-teal-500 text-teal-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Waiting Room
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                {queue.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`px-4 py-4 font-medium border-b-2 transition-colors ${
              activeTab === "scheduled"
                ? "border-teal-500 text-teal-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Today's Schedule
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                {scheduled.length}
              </span>
            </div>
          </button>
        </div>

        {/* Queue Tab */}
        {activeTab === "queue" && (
          <div className="space-y-4">
            {queue.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-900">
                  No patients waiting
                </p>
              </div>
            ) : (
              queue.map((item) => (
                <Link
                  key={item.id}
                  to={`/clinician/patient/${item.id}`}
                  className={`block p-6 rounded-xl border-2 transition-all hover:shadow-md cursor-pointer ${
                    item.priority === "high"
                      ? "bg-red-50 border-red-200"
                      : item.priority === "medium"
                      ? "bg-amber-50 border-amber-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-slate-700">
                          {item.avatar}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {item.patient}
                        </h3>
                        <p className="text-slate-600 mb-2">{item.reason}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Waiting: {item.waitTime}
                          </span>
                          <span>Requested: {item.requestTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          item.priority === "high"
                            ? "bg-red-200 text-red-800"
                            : item.priority === "medium"
                            ? "bg-amber-200 text-amber-800"
                            : "bg-blue-200 text-blue-800"
                        }`}
                      >
                        {item.priority.charAt(0).toUpperCase() +
                          item.priority.slice(1)}{" "}
                        Priority
                      </span>
                      <button className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium">
                        Start Visit
                      </button>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === "scheduled" && (
          <div className="space-y-4">
            {scheduled.map((visit) => (
              <Link
                key={visit.id}
                to={`/clinician/patient/${visit.id}`}
                className="block p-6 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-teal-600">
                        {visit.avatar}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {visit.patient}
                      </h3>
                      <p className="text-slate-600 mb-2">{visit.reason}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {visit.time} ({visit.duration})
                        </span>
                        <span className="flex items-center gap-1">
                          {visit.type === "Virtual" ? (
                            <>
                              <Video className="w-4 h-4" />
                              Virtual
                            </>
                          ) : (
                            <>
                              <MapPin className="w-4 h-4" />
                              In-person
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ClinicianLayout>
  );
}
