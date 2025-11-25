import { Link } from "react-router-dom";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share2,
  PhoneOff,
  Signal,
  Clock,
  User,
  Heart,
  Zap,
  AlertCircle,
  FileText,
  Plus,
  Send,
  X,
} from "lucide-react";
import { useState } from "react";

export default function ClinicianVirtualVisit() {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [notes, setNotes] = useState("");
  const [connectionQuality, setConnectionQuality] = useState("excellent");
  const [visitTime, setVisitTime] = useState("12:45");

  const tabs = ["info", "vitals", "care-plan", "notes", "orders", "chat"];

  const patientInfo = {
    name: "Sarah Chen",
    age: 34,
    sex: "Female",
    medications: ["Metformin 500mg", "Lisinopril 10mg"],
    allergies: ["Penicillin"],
  };

  const vitals = {
    heartRate: 72,
    spo2: 98,
    respiration: 16,
    hrv: 45,
    stressLevel: 35,
    recoveryScore: 78,
  };

  const carePlanItems = [
    "Vitamin D3 - 2000 IU daily",
    "Omega-3 - 1000mg daily",
    "Cardio 3x per week",
    "Follow-up labs in 2 weeks",
  ];

  const orders = [
    { type: "Labs", description: "Comprehensive metabolic panel", status: "pending" },
    { type: "Medication", description: "Increase Lisinopril to 20mg", status: "draft" },
  ];

  const messages = [
    { sender: "Clinician", text: "How are you feeling today?", time: "12:40 PM" },
    { sender: "Patient", text: "Good, no new symptoms", time: "12:41 PM" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">Virtual Visit - {patientInfo.name}</h1>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Signal className={`w-4 h-4 ${connectionQuality === "excellent" ? "text-emerald-500" : "text-amber-500"}`} />
            <span className="capitalize">{connectionQuality}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white">
            <Clock className="w-5 h-5" />
            <span className="font-mono">{visitTime}</span>
          </div>
          <Link
            to="/clinician/dashboard"
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Video Panel (60%) */}
        <div className="flex-1 flex flex-col bg-slate-900 relative">
          {/* Video Window */}
          <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
            <div className="text-center">
              <div className="w-32 h-32 bg-teal-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <User className="w-16 h-16 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{patientInfo.name}</h2>
              <p className="text-slate-400">Connected • Live</p>
            </div>

            {/* Patient Self View */}
            <div className="absolute bottom-24 right-6 w-40 h-32 bg-slate-700 rounded-xl border-2 border-teal-500 overflow-hidden shadow-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <User className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm text-white font-medium">You</p>
                {isCameraOff && <p className="text-xs text-slate-400 mt-1">Camera Off</p>}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-slate-800 border-t border-slate-700 px-6 py-6 flex justify-center gap-6">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full transition-colors ${
                isMuted
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-teal-600 hover:bg-teal-700"
              } text-white`}
            >
              {isMuted ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={() => setIsCameraOff(!isCameraOff)}
              className={`p-4 rounded-full transition-colors ${
                isCameraOff
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-teal-600 hover:bg-teal-700"
              } text-white`}
            >
              {isCameraOff ? (
                <VideoOff className="w-6 h-6" />
              ) : (
                <Video className="w-6 h-6" />
              )}
            </button>

            <button className="p-4 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors">
              <Share2 className="w-6 h-6" />
            </button>

            <button className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors">
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Right: Clinical Tools Sidebar (40%) */}
        <div className="w-96 bg-white border-l border-slate-200 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-slate-200 bg-slate-50 px-4 flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? "text-teal-600 border-b-2 border-teal-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Patient Info Tab */}
            {activeTab === "info" && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{patientInfo.name}</p>
                    <p className="text-sm text-slate-600">{patientInfo.age}yo, {patientInfo.sex}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-2">Current Medications</p>
                  <ul className="space-y-1 text-sm text-slate-600">
                    {patientInfo.medications.map((med, idx) => (
                      <li key={idx}>• {med}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-2">Allergies</p>
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">{patientInfo.allergies.join(", ")}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Vitals Tab */}
            {activeTab === "vitals" && (
              <div className="space-y-3">
                {[
                  { label: "Heart Rate", value: vitals.heartRate, unit: "bpm", icon: Heart },
                  { label: "SpO₂", value: vitals.spo2, unit: "%", icon: Heart },
                  { label: "Respiration", value: vitals.respiration, unit: "/min", icon: Zap },
                  { label: "HRV", value: vitals.hrv, unit: "ms", icon: Zap },
                  { label: "Stress Level", value: vitals.stressLevel, unit: "%", icon: AlertCircle },
                  { label: "Recovery Score", value: vitals.recoveryScore, unit: "/100", icon: Heart },
                ].map((vital, idx) => {
                  const Icon = vital.icon;
                  return (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-teal-600" />
                          <span className="text-sm font-medium text-slate-900">{vital.label}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{vital.value}</p>
                          <p className="text-xs text-slate-500">{vital.unit}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Care Plan Tab */}
            {activeTab === "care-plan" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-semibold text-slate-900">Active Care Plan</p>
                  <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">Edit</button>
                </div>
                {carePlanItems.map((item, idx) => (
                  <div key={idx} className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                    <p className="text-sm text-slate-700">• {item}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === "notes" && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">Clinical notes (auto-saved)</p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Type clinical notes here..."
                  className="w-full p-3 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none"
                  rows={6}
                />
                <p className="text-xs text-slate-500">Auto-saved at 12:45 PM</p>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                <div className="space-y-3">
                  {orders.map((order, idx) => (
                    <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-slate-900">{order.type}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          order.status === "draft"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{order.description}</p>
                    </div>
                  ))}
                </div>

                <button className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-lg font-medium transition-colors">
                  <Plus className="w-5 h-5" />
                  Add Order
                </button>

                <button className="w-full flex items-center justify-center gap-2 border-2 border-teal-500 text-teal-600 py-3 rounded-lg font-medium hover:bg-teal-50 transition-colors">
                  <Send className="w-5 h-5" />
                  Send to Patient
                </button>
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === "chat" && (
              <div className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === "Clinician" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl ${
                          msg.sender === "Clinician"
                            ? "bg-teal-500 text-white rounded-br-none"
                            : "bg-slate-100 text-slate-900 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.sender === "Clinician" ? "text-teal-100" : "text-slate-500"}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type message..."
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 outline-none"
                  />
                  <button className="p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
