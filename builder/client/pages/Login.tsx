import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to dashboard after login
      window.location.href = "/dashboard";
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-slate-50 flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <div className="flex items-center gap-3">
            <img 
              src="https://cdn.builder.io/api/v1/image/assets%2Ff0e178cb947e448182889b581f07529d%2F9e0f1a3b796e459286bbf9636ed59102?format=webp&width=100" 
              alt="MyHealthAlly Logo" 
              className="h-8"
            />
            <span className="font-bold text-lg text-slate-900 hidden sm:inline">MyHealthAlly</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 px-8 py-12 text-center">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Welcome to MyHealthAlly
              </h1>
              <p className="text-slate-600">
                Your health, connected.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-900">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all bg-white text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-900">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all bg-white text-slate-900 placeholder:text-slate-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <a href="#" className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors">
                  Forgot password?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-slate-400 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="px-8 py-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">New to MyHealthAlly?</span>
                </div>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="px-8 pb-8">
              <Link
                to="/signup"
                className="w-full border-2 border-teal-500 hover:border-teal-600 text-teal-600 hover:text-teal-700 py-3 rounded-xl font-semibold transition-colors text-center block"
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* Footer Text */}
          <div className="mt-8 text-center text-sm text-slate-600">
            <p>By signing in, you agree to our</p>
            <div className="flex justify-center gap-1 flex-wrap">
              <a href="#" className="text-teal-600 hover:text-teal-700 font-medium">
                Terms of Service
              </a>
              <span>and</span>
              <a href="#" className="text-teal-600 hover:text-teal-700 font-medium">
                Privacy Policy
              </a>
            </div>
          </div>

          {/* Bottom Wellness Illustration */}
          <div className="mt-12 flex justify-center">
            <svg
              width="200"
              height="140"
              viewBox="0 0 200 140"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="opacity-60"
            >
              {/* Heartbeat line */}
              <path
                d="M20 70 L35 70 L40 50 L50 90 L60 70 L80 70"
                stroke="#2BA39B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Wellness circle */}
              <circle cx="130" cy="50" r="25" stroke="#2BA39B" strokeWidth="2" fill="none" />
              {/* Health check mark inside circle */}
              <path
                d="M120 50 L125 55 L140 40"
                stroke="#2F8F83"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Leaf elements (wellness) */}
              <path
                d="M50 120 Q55 110 60 120"
                stroke="#2BA39B"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M70 125 Q75 115 80 125"
                stroke="#2BA39B"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M90 120 Q95 110 100 120"
                stroke="#2BA39B"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
              {/* Decorative dots */}
              <circle cx="40" cy="100" r="1.5" fill="#2BA39B" />
              <circle cx="160" cy="100" r="1.5" fill="#2BA39B" />
              <circle cx="100" cy="130" r="1.5" fill="#2BA39B" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
