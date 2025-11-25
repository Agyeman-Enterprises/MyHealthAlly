import { Link } from "react-router-dom";
import { Heart, Zap, TrendingUp, Calendar, Filter, Download, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function VitalsTrends() {
  const [dateRange, setDateRange] = useState("week");
  const [selectedMetrics, setSelectedMetrics] = useState({
    heartRate: true,
    hrv: true,
    bloodPressure: true,
    weight: true,
    glucose: true,
  });

  const metrics = [
    {
      id: "heartRate",
      name: "Heart Rate",
      unit: "bpm",
      current: 72,
      avg: 71,
      high: 85,
      low: 68,
      trend: "-2%",
      icon: Heart,
      color: "teal",
      description: "Average resting heart rate",
    },
    {
      id: "hrv",
      name: "HRV (Heart Rate Variability)",
      unit: "ms",
      current: 45,
      avg: 43,
      high: 52,
      low: 38,
      trend: "+5%",
      icon: Zap,
      color: "emerald",
      description: "Indicates nervous system balance",
    },
    {
      id: "bloodPressure",
      name: "Blood Pressure",
      unit: "mmHg",
      current: "120/80",
      avg: "118/79",
      high: "135/88",
      low: "110/72",
      trend: "stable",
      icon: TrendingUp,
      color: "teal",
      description: "Systolic/Diastolic readings",
    },
    {
      id: "weight",
      name: "Weight",
      unit: "lbs",
      current: 165,
      avg: 166,
      high: 170,
      low: 163,
      trend: "-1%",
      icon: TrendingUp,
      color: "slate",
      description: "Body weight tracking",
    },
    {
      id: "glucose",
      name: "Fasting Glucose",
      unit: "mg/dL",
      current: 95,
      avg: 98,
      high: 110,
      low: 88,
      trend: "-3%",
      icon: Heart,
      color: "teal",
      description: "Blood sugar levels",
    },
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
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Download className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Vitals Trends</h1>
          <p className="text-lg text-slate-600">Monitor your health metrics over time</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-slate-600" />
              <div className="flex gap-2">
                {["1w", "1m", "3m", "6m", "1y"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      dateRange === range
                        ? "bg-teal-500 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">Last 7 days</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const isTeal = metric.color === "teal";
            const isEmerald = metric.color === "emerald";
            return (
              <div
                key={metric.id}
                className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                      isTeal ? "bg-teal-100" : isEmerald ? "bg-emerald-100" : "bg-slate-100"
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        isTeal ? "text-teal-600" : isEmerald ? "text-emerald-600" : "text-slate-600"
                      }`} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{metric.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{metric.description}</p>
                  </div>
                  <div className={`text-sm font-bold ${
                    metric.trend === "stable" ? "text-slate-600" : metric.trend.startsWith("+") ? "text-emerald-600" : "text-teal-600"
                  }`}>
                    {metric.trend}
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="bg-gradient-to-b from-teal-50 to-slate-50 rounded-xl h-48 mb-6 flex items-end justify-around p-4">
                  {[65, 72, 68, 75, 71, 73, 70].map((val, idx) => (
                    <div
                      key={idx}
                      className="flex-1 mx-1 bg-teal-400 rounded-t-lg opacity-80 hover:opacity-100 transition-opacity"
                      style={{ height: `${(val / 80) * 100}%` }}
                    ></div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-600 mb-1">Current</p>
                    <p className="text-lg font-bold text-slate-900">{metric.current}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-600 mb-1">Average</p>
                    <p className="text-lg font-bold text-slate-900">{metric.avg}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-600 mb-1">Range</p>
                    <p className="text-xs font-medium text-slate-700">{metric.low}—{metric.high}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Link */}
        <div className="text-center mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
          >
            Back to Dashboard <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
