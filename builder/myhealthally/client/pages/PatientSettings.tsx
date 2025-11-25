import PatientLayout from "@/components/PatientLayout";
import { Link } from "react-router-dom";
import {
  Bell,
  Lock,
  Eye,
  Download,
  LogOut,
  ChevronRight,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import BiometricUnlock from "@/components/BiometricUnlock";

export default function PatientSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);

  const settingsSections = [
    {
      title: "Notifications",
      items: [
        {
          label: "Email Notifications",
          icon: Bell,
          toggle: emailNotifications,
          setToggle: setEmailNotifications,
        },
        {
          label: "SMS Notifications",
          icon: Smartphone,
          toggle: smsNotifications,
          setToggle: setSmsNotifications,
        },
        {
          label: "Appointment Reminders",
          icon: Bell,
          toggle: appointmentReminders,
          setToggle: setAppointmentReminders,
        },
      ],
    },
    {
      title: "Security",
      items: [
        {
          label: "Change Password",
          icon: Lock,
          action: () => alert("Change password modal"),
        },
        {
          label: "Privacy Settings",
          icon: Eye,
          action: () => alert("Privacy settings modal"),
        },
      ],
    },
    {
      title: "Data",
      items: [
        {
          label: "Download My Data",
          icon: Download,
          action: () => alert("Downloading your data..."),
        },
      ],
    },
  ];

  return (
    <PatientLayout activePage="/settings">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600">
            Manage your account preferences and security
          </p>
        </div>

        {/* Biometric Unlock */}
        <div className="mb-8">
          <BiometricUnlock />
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {settingsSections.map((section) => (
            <div key={section.title} className="bg-white rounded-xl border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">
                  {section.title}
                </h2>
              </div>
              <div className="divide-y divide-slate-200">
                {section.items.map((item) => (
                  <div
                    key={item.label}
                    className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-slate-600" />
                      <span className="font-medium text-slate-900">
                        {item.label}
                      </span>
                    </div>
                    {item.toggle !== undefined ? (
                      <button
                        onClick={() =>
                          item.setToggle && item.setToggle(!item.toggle)
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          item.toggle
                            ? "bg-teal-500"
                            : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            item.toggle ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    ) : (
                      <button
                        onClick={item.action}
                        className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Sign Out Button */}
          <button className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </PatientLayout>
  );
}
