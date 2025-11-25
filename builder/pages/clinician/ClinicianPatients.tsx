import { Link } from "react-router-dom";
import { Search, ChevronRight, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function ClinicianPatients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const patients = [
    {
      id: 1,
      name: "Sarah Chen",
      age: 34,
      conditions: "Prediabetes, HRV monitoring",
      lastVisit: "Dec 8, 2023",
      riskLevel: "medium",
      alerts: 1,
    },
    {
      id: 2,
      name: "Michael Johnson",
      age: 45,
      conditions: "Hypertension, Sleep apnea",
      lastVisit: "Dec 1, 2023",
      riskLevel: "high",
      alerts: 1,
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      age: 28,
      conditions: "Wellness tracking",
      lastVisit: "Dec 15, 2023",
      riskLevel: "low",
      alerts: 0,
    },
    {
      id: 4,
      name: "John Smith",
      age: 52,
      conditions: "Diabetes, Cardiovascular",
      lastVisit: "Nov 30, 2023",
      riskLevel: "high",
      alerts: 2,
    },
    {
      id: 5,
      name: "Lisa Park",
      age: 38,
      conditions: "Stress management, Fitness",
      lastVisit: "Dec 10, 2023",
      riskLevel: "low",
      alerts: 0,
    },
    {
      id: 6,
      name: "Robert Davis",
      age: 61,
      conditions: "Post-cardiac event",
      lastVisit: "Dec 5, 2023",
      riskLevel: "critical",
      alerts: 3,
    },
  ];

  const filteredPatients = patients
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "risk")
        return (
          ["critical", "high", "medium", "low"].indexOf(b.riskLevel) -
          ["critical", "high", "medium", "low"].indexOf(a.riskLevel)
        );
      return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
    });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-700" };
      case "high":
        return { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700" };
      case "medium":
        return { bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-700" };
      default:
        return { bg: "bg-green-50", border: "border-green-200", badge: "bg-green-100 text-green-700" };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/clinician/dashboard" className="flex items-center gap-3">
            <img 
              src="https://cdn.builder.io/api/v1/image/assets%2Ff0e178cb947e448182889b581f07529d%2F9e0f1a3b796e459286bbf9636ed59102?format=webp&width=100" 
              alt="MyHealthAlly Logo" 
              className="h-8"
            />
            <span className="font-bold text-lg text-slate-900">Clinical Portal</span>
          </Link>
          <Link to="/clinician/dashboard" className="text-teal-600 hover:text-teal-700 font-medium">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Patient List</h1>
          <p className="text-lg text-slate-600">Manage and monitor your patient roster</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            {/* Search */}
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patients..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
            >
              <option value="name">Sort by Name</option>
              <option value="risk">Sort by Risk Level</option>
              <option value="activity">Sort by Recent Activity</option>
            </select>
          </div>
        </div>

        {/* Patient Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => {
            const colors = getRiskColor(patient.riskLevel);
            return (
              <Link
                key={patient.id}
                to={`/clinician/patient/${patient.id}`}
                className={`${colors.bg} border ${colors.border} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <span className="text-teal-600 font-bold">{patient.name.charAt(0)}</span>
                  </div>
                  {patient.alerts > 0 && (
                    <span className="flex items-center gap-1 text-red-600 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      {patient.alerts}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 mb-1">{patient.name}</h3>
                <p className="text-sm text-slate-600 mb-3">{patient.age} years old</p>

                <div className="mb-4">
                  <p className="text-xs text-slate-600 mb-1">Conditions</p>
                  <p className="text-sm text-slate-700">{patient.conditions}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-current border-opacity-20">
                  <p className="text-xs text-slate-600">Last visit: {patient.lastVisit}</p>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${colors.badge}`}>
                    {patient.riskLevel.charAt(0).toUpperCase() + patient.riskLevel.slice(1)}
                  </span>
                </div>

                <button className="w-full mt-4 bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  View Profile
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            );
          })}
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600">No patients found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
