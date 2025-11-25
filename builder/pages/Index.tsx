import { Link } from "react-router-dom";
import { Heart, Zap, BarChart3, Lock, MessageSquare, Clock } from "lucide-react";

export default function Index() {
  const features = [
    {
      icon: Heart,
      title: "Real-Time Vitals",
      description: "Monitor heart rate, HRV, blood pressure, and more with continuous health tracking.",
    },
    {
      icon: BarChart3,
      title: "Health Trends",
      description: "See your wellness patterns over time with beautiful, interactive charts.",
    },
    {
      icon: MessageSquare,
      title: "Care Team Access",
      description: "Connect directly with your healthcare providers for personalized guidance.",
    },
    {
      icon: Lock,
      title: "Privacy First",
      description: "Your health data is encrypted and protected with clinical-grade security.",
    },
    {
      icon: Zap,
      title: "Personalized Plans",
      description: "Get customized care plans based on your unique health profile.",
    },
    {
      icon: Clock,
      title: "Lifetime History",
      description: "Access your complete health history anytime, anywhere on any device.",
    },
  ];

  const testimonials = [
    {
      quote: "MyHealthAlly transformed how I understand my health. The insights are incredible.",
      author: "Sarah Chen",
      role: "Patient",
    },
    {
      quote: "Finally, a platform that puts patients and clinicians on the same page.",
      author: "Dr. James Wilson",
      role: "Family Medicine",
    },
    {
      quote: "The user experience is so calm and intuitive. I actually enjoy checking my health data.",
      author: "Marcus Thompson",
      role: "Wellness Enthusiast",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://cdn.builder.io/api/v1/image/assets%2Ff0e178cb947e448182889b581f07529d%2F9e0f1a3b796e459286bbf9636ed59102?format=webp&width=100" 
              alt="MyHealthAlly Logo" 
              className="h-8"
            />
            <span className="font-bold text-xl text-slate-900 hidden sm:inline">MyHealthAlly</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium">
              Sign In
            </Link>
            <Link to="/login" className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-xl font-medium transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
                Track your health,{" "}
                <span className="text-teal-500">effortlessly</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                MyHealthAlly connects you with your health data and care team. Monitor vitals, understand trends, and take control of your wellness.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/login"
                className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-colors text-center"
              >
                Start Free Trial
              </Link>
              <button className="border-2 border-slate-300 hover:border-slate-400 text-slate-900 px-8 py-4 rounded-2xl font-semibold text-lg transition-colors">
                Watch Demo
              </button>
            </div>
          </div>

          {/* iPhone Mockup */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-3xl blur-2xl opacity-50"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl p-3 border border-slate-200">
              <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
                <div className="text-center text-white space-y-4 p-8">
                  <Heart className="w-16 h-16 mx-auto text-teal-400" />
                  <div>
                    <p className="text-sm text-slate-300">Heart Rate</p>
                    <p className="text-4xl font-bold">72 bpm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              Everything you need for better health
            </h2>
            <p className="text-xl text-slate-600">
              Comprehensive tools designed for both patients and clinicians
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl border border-slate-200 hover:border-teal-300 transition-colors"
                >
                  <div className="bg-teal-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dashboard Preview Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
            Patient Dashboard Preview
          </h2>
          <p className="text-xl text-slate-600">
            View all your health metrics in one beautiful dashboard
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-600 px-8 py-6">
            <p className="text-white font-semibold">Welcome back, Sarah</p>
            <p className="text-teal-100">Your health data is updating in real time</p>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-5 gap-4 mb-8">
              {[
                { label: "Heart Rate", value: "72", unit: "bpm" },
                { label: "HRV", value: "45", unit: "ms" },
                { label: "BP", value: "120/80", unit: "mmHg" },
                { label: "Weight", value: "165", unit: "lbs" },
                { label: "Glucose", value: "95", unit: "mg/dL" },
              ].map((vital, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-teal-50 to-slate-50 p-4 rounded-xl border border-teal-200"
                >
                  <p className="text-sm text-slate-600 mb-2">{vital.label}</p>
                  <p className="text-2xl font-bold text-teal-600">{vital.value}</p>
                  <p className="text-xs text-slate-500">{vital.unit}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Recent Trends</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Heart Rate</span>
                    <span className="text-teal-600 font-semibold">↓ 2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">HRV</span>
                    <span className="text-emerald-600 font-semibold">↑ 5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Sleep Score</span>
                    <span className="text-teal-600 font-semibold">↑ 8%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Care Plan</h3>
                <p className="text-sm text-slate-600 mb-4">Your current wellness plan</p>
                <button className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-xl font-medium transition-colors">
                  View Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              Trusted by patients and clinicians
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl border border-slate-200"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-teal-400 rounded-full"></div>
                  ))}
                </div>
                <p className="text-slate-700 italic mb-6">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-slate-900">{testimonial.author}</p>
                  <p className="text-sm text-slate-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Ready to take control of your health?
          </h2>
          <p className="text-xl text-teal-100">
            Join thousands of patients and clinics using MyHealthAlly
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="bg-white hover:bg-slate-50 text-teal-600 px-8 py-4 rounded-2xl font-semibold text-lg transition-colors"
            >
              Start Free Trial
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/10 transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Docs</a></li>
                <li><a href="#" className="hover:text-white transition">Support</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2024 MyHealthAlly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
