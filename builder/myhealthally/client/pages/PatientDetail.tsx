import { Link } from "react-router-dom";
import { Heart, TrendingUp, AlertCircle, Calendar, Phone, Mail, MapPin, Download, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function PatientDetail() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = ["overview", "vitals", "labs", "care-plan", "timeline", "messages"];

  const patient = {
    name: "Sarah Chen",
    age: 34,
    id: "MHA-12345",
    phone: "(555) 123-4567",
    email: "sarah.chen@email.com",
    address: "123 Main St, Anytown, CA 90210",
    provider: "Dr. James Wilson",
    joinedDate: "March 2023",
    status: "Active",
  };

  const recentVitals = [
    { label: "Heart Rate", value: "72", unit: "bpm", status: "Normal" },
    { label: "HRV", value: "45", unit: "ms", status: "Good" },
    { label: "Blood Pressure", value: "120/80", unit: "mmHg", status: "Normal" },
    { label: "Weight", value: "165", unit: "lbs", status: "Stable" },
  ];

  const labResults = [
    { test: "Glucose (Fasting)", value: "95", unit: "mg/dL", status: "Normal", date: "Dec 1, 2023" },
    { test: "Vitamin D", value: "32", unit: "ng/mL", status: "Low", date: "Dec 1, 2023" },
    { test: "Hemoglobin A1c", value: "5.4", unit: "%", status: "Normal", date: "Dec 1, 2023" },
  ];

  const alerts = [
    { type: "warning", message: "Vitamin D supplementation recommended" },
    { type: "info", message: "Next annual checkup due in 3 months" },
  ];

  const timeline = [
    { date: "Dec 8, 2023", event: "Annual Checkup Completed", provider: "Dr. Wilson" },
    { date: "Dec 1, 2023", event: "Lab Results: All Normal", result: "Labs ordered" },
    { date: "Nov 15, 2023", event: "Care Plan Updated", items: "Supplements, Exercise" },
  ];

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
            Back to Staff
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-4xl font-bold text-teal-600">SC</span>
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">{patient.name}</h1>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Patient ID</p>
                  <p className="font-medium text-slate-900">{patient.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Age</p>
                  <p className="font-medium text-slate-900">{patient.age} years old</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Primary Provider</p>
                  <p className="font-medium text-slate-900">{patient.provider}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Member Since</p>
                  <p className="font-medium text-slate-900">{patient.joinedDate}</p>
                </div>
              </div>

              {/* Alerts */}
              {alerts.length > 0 && (
                <div className="space-y-2">
                  {alerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 text-sm ${
                        alert.type === "warning"
                          ? "text-amber-700 bg-amber-50 px-3 py-2 rounded-lg"
                          : "text-blue-700 bg-blue-50 px-3 py-2 rounded-lg"
                      }`}
                    >
                      <AlertCircle className="w-4 h-4" />
                      {alert.message}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact & Actions */}
            <div className="w-full md:w-64 space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </p>
                <p className="font-medium text-slate-900">{patient.phone}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </p>
                <p className="font-medium text-slate-900">{patient.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </p>
                <p className="font-medium text-slate-900 text-sm">{patient.address}</p>
              </div>

              <div className="pt-4 space-y-2 border-t border-slate-200">
                <button className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg font-medium transition-colors">
                  Message Patient
                </button>
                <button className="w-full border-2 border-slate-300 text-slate-700 py-2 rounded-lg font-medium hover:border-slate-400 transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Record
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-8">
          <div className="flex overflow-x-auto border-b border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Vitals</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    {recentVitals.map((vital, idx) => (
                      <div key={idx} className="p-4 bg-teal-50 rounded-xl border border-teal-200">
                        <p className="text-sm text-slate-600 mb-2">{vital.label}</p>
                        <p className="text-2xl font-bold text-slate-900">{vital.value}</p>
                        <p className="text-xs text-slate-500 mt-1">{vital.unit}</p>
                        <p className="text-xs text-teal-600 font-medium mt-2">{vital.status}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Active Care Plan</h3>
                  <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-xl border border-teal-200">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-slate-600 mb-2">Supplements</p>
                        <ul className="space-y-1 text-sm">
                          <li>✓ Vitamin D3 - 2000 IU</li>
                          <li>✓ Omega-3 - 1000mg</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-2">Nutrition</p>
                        <p className="text-sm">High-protein breakfast, balanced macros for meals</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-2">Exercise</p>
                        <p className="text-sm">Cardio 3x/week, Strength 2x/week</p>
                      </div>
                    </div>
                    <button className="mt-4 text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-2">
                      View Full Plan <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "vitals" && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Vitals History</h3>
                <div className="space-y-3">
                  {recentVitals.map((vital, idx) => (
                    <div key={idx} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{vital.label}</p>
                        <p className="text-sm text-slate-600">Last recorded today</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">{vital.value}</p>
                        <p className="text-sm text-slate-500">{vital.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "labs" && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Lab Results</h3>
                <div className="space-y-3">
                  {labResults.map((lab, idx) => (
                    <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{lab.test}</p>
                          <p className="text-sm text-slate-600">{lab.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-slate-900">{lab.value}</p>
                          <p className={`text-sm font-medium ${lab.status === "Normal" ? "text-emerald-600" : "text-amber-600"}`}>
                            {lab.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Timeline</h3>
                <div className="space-y-4">
                  {timeline.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-teal-500 mt-2"></div>
                        {idx < timeline.length - 1 && <div className="w-0.5 h-12 bg-slate-200 my-2"></div>}
                      </div>
                      <div className="pb-4">
                        <p className="font-medium text-slate-900">{item.event}</p>
                        <p className="text-sm text-slate-600">{item.date}</p>
                        {item.provider && <p className="text-sm text-slate-500 mt-1">By {item.provider}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
