'use client';

import { PatientFacingCopy } from '@/lib/ux-copy/patient-facing';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 mb-3">
            MyHealthAlly is a health navigation and concierge platform. Medical services are provided by independent, licensed practices.
          </p>
          <p className="text-sm text-gray-600 mb-2">
            {PatientFacingCopy.footerDisclaimer.text}
          </p>
          <p className="text-sm font-medium text-red-600">
            {PatientFacingCopy.footerDisclaimer.emergency}
          </p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} MyHealth Ally. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
