import { Fingerprint, Smartphone, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function BiometricUnlock() {
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  const [fingerprintEnabled, setFingerprintEnabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">
          Biometric Unlock
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Use Face ID or Fingerprint to quickly unlock your account
        </p>
      </div>

      <div className="divide-y divide-slate-200">
        {/* Face ID Option */}
        <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Smartphone className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Face ID</p>
              <p className="text-sm text-slate-500">
                {faceIdEnabled ? "Enabled" : "Not enabled"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setFaceIdEnabled(!faceIdEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              faceIdEnabled ? "bg-teal-500" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                faceIdEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Fingerprint Option */}
        <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Fingerprint className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Fingerprint</p>
              <p className="text-sm text-slate-500">
                {fingerprintEnabled ? "Enabled" : "Not enabled"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setFingerprintEnabled(!fingerprintEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              fingerprintEnabled ? "bg-teal-500" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                fingerprintEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Password Fallback */}
      {(faceIdEnabled || fingerprintEnabled) && (
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="mb-4">
            <p className="text-sm font-medium text-slate-900 mb-2">
              Password Fallback
            </p>
            <p className="text-xs text-slate-600 mb-4">
              Enter your password to confirm biometric setup
            </p>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-600 hover:text-slate-900"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="mt-4 flex gap-3">
            <button className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
              Cancel
            </button>
            <button className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors">
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
