import { Link } from "react-router-dom";
import { Users, Stethoscope, ArrowRight } from "lucide-react";

export default function RoleSelection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Ff0e178cb947e448182889b581f07529d%2F9e0f1a3b796e459286bbf9636ed59102?format=webp&width=100"
              alt="MyHealthAlly Logo"
              className="h-8"
            />
            <span className="font-bold text-lg text-slate-900 hidden sm:inline">
              MyHealthAlly
            </span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Welcome to MyHealthAlly
            </h1>
            <p className="text-xl text-slate-600">
              Choose your role to get started
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Patient Card */}
            <Link
              to="/dashboard"
              className="group bg-white rounded-2xl shadow-lg border border-slate-200 p-8 hover:shadow-xl transition-all hover:border-teal-300"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-teal-100 rounded-xl mb-6 group-hover:bg-teal-200 transition-colors">
                <Users className="w-8 h-8 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Patient
              </h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Monitor your health, track vitals, communicate with your care
                team, and take control of your wellness journey.
              </p>
              <div className="flex items-center gap-2 text-teal-600 font-medium group-hover:gap-4 transition-all">
                Continue as Patient
                <ArrowRight className="w-5 h-5" />
              </div>
            </Link>

            {/* Clinician Card */}
            <Link
              to="/clinician/dashboard"
              className="group bg-white rounded-2xl shadow-lg border border-slate-200 p-8 hover:shadow-xl transition-all hover:border-emerald-300"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-xl mb-6 group-hover:bg-emerald-200 transition-colors">
                <Stethoscope className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Clinician
              </h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Manage your patient panel, review alerts, edit care plans, and
                provide virtual care to your patients.
              </p>
              <div className="flex items-center gap-2 text-emerald-600 font-medium group-hover:gap-4 transition-all">
                Continue as Clinician
                <ArrowRight className="w-5 h-5" />
              </div>
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center">
            <p className="text-slate-600">
              Need help?{" "}
              <a href="#" className="text-teal-600 hover:text-teal-700 font-medium">
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
