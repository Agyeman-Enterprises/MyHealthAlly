import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Video, User, ChevronRight, Plus, X } from "lucide-react";
import { useState } from "react";

export default function Appointments() {
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");

  const upcomingAppointments = [
    {
      id: 1,
      provider: "Dr. James Wilson",
      role: "Primary Care Physician",
      date: "Tomorrow",
      time: "2:00 PM",
      duration: "30 minutes",
      type: "Virtual",
      reason: "Regular Checkup",
      status: "confirmed",
    },
    {
      id: 2,
      provider: "Dr. Emily Chen",
      role: "Cardiologist",
      date: "January 15, 2024",
      time: "10:00 AM",
      duration: "45 minutes",
      type: "In-Person",
      reason: "Heart Rate Monitoring",
      status: "confirmed",
      location: "123 Health St, Suite 200",
    },
  ];

  const pastAppointments = [
    {
      id: 3,
      provider: "Dr. James Wilson",
      role: "Primary Care Physician",
      date: "December 8, 2023",
      time: "2:00 PM",
      type: "Virtual",
      reason: "Annual Checkup",
      notes: "Labs ordered, all vitals normal",
    },
    {
      id: 4,
      provider: "Wellness Coach - Michael",
      role: "Health Coach",
      date: "December 1, 2023",
      time: "3:00 PM",
      type: "Virtual",
      reason: "Lifestyle Counseling",
      notes: "Discussed exercise routine",
    },
  ];

  const appointmentReasons = [
    "Regular Checkup",
    "Lab Review",
    "Follow-up",
    "Symptom Consultation",
    "Medication Review",
    "Preventive Care",
    "Other",
  ];

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Appointments</h1>
            <p className="text-lg text-slate-600">Schedule and manage your visits</p>
          </div>
          <button
            onClick={() => setShowScheduleForm(!showScheduleForm)}
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-2xl font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Schedule Visit
          </button>
        </div>

        {/* Schedule Form */}
        {showScheduleForm && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Schedule a Visit</h2>
              <button
                onClick={() => setShowScheduleForm(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Visit Type */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  Visit Type
                </label>
                <div className="flex gap-4">
                  <button className="flex-1 border-2 border-teal-500 text-teal-600 py-3 rounded-xl font-medium">
                    Virtual Visit
                  </button>
                  <button className="flex-1 border-2 border-slate-300 text-slate-700 py-3 rounded-xl font-medium hover:border-slate-400">
                    In-Person Visit
                  </button>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  Reason for Visit
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                >
                  <option value="">Select a reason</option>
                  {appointmentReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-3">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-3">
                    Preferred Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  Additional Notes (Optional)
                </label>
                <textarea
                  placeholder="Tell us more about why you need this visit..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl font-semibold transition-colors">
                  Request Appointment
                </button>
                <button
                  onClick={() => setShowScheduleForm(false)}
                  className="flex-1 border-2 border-slate-300 text-slate-700 py-3 rounded-xl font-semibold hover:border-slate-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Appointments */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Upcoming Appointments</h2>
          <div className="space-y-4">
            {upcomingAppointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-white rounded-2xl border border-teal-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{apt.provider}</h3>
                    <p className="text-sm text-slate-600">{apt.role}</p>
                  </div>
                  <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-lg text-sm font-medium">
                    {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    <span>{apt.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Clock className="w-5 h-5 text-teal-600" />
                    <span>{apt.time} ({apt.duration})</span>
                  </div>
                </div>

                {apt.location && (
                  <div className="flex items-center gap-3 text-slate-700 mb-4">
                    <MapPin className="w-5 h-5 text-teal-600" />
                    <span>{apt.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-700 mb-6">
                  {apt.type === "Virtual" ? (
                    <Video className="w-5 h-5 text-teal-600" />
                  ) : (
                    <MapPin className="w-5 h-5 text-teal-600" />
                  )}
                  <span className="font-medium">{apt.type}</span>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg font-medium transition-colors">
                    {apt.type === "Virtual" ? "Join Visit" : "Confirm"}
                  </button>
                  <button className="flex-1 border-2 border-slate-300 text-slate-700 py-2 rounded-lg font-medium hover:border-slate-400 transition-colors">
                    Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Past Appointments */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Past Appointments</h2>
          <div className="space-y-4">
            {pastAppointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900">{apt.provider}</h3>
                  <p className="text-sm text-slate-600">{apt.role}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4 text-slate-700">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <span>{apt.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <span>{apt.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-slate-400" />
                    <span>{apt.type}</span>
                  </div>
                </div>

                {apt.notes && (
                  <p className="text-slate-600 text-sm pt-4 border-t border-slate-200">
                    <span className="font-medium">Notes:</span> {apt.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
