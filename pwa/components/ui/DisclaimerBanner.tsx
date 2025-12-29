'use client';

interface DisclaimerBannerProps {
  variant?: 'default' | 'compact';
}

export function DisclaimerBanner({ variant = 'default' }: DisclaimerBannerProps) {
  if (variant === 'compact') {
    return (
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 mb-4">
        <p className="text-sm text-navy-600">
          <span className="font-medium">Note:</span> MyHealth Ally does not provide medical diagnosis, treatment, or prescriptions.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-sky-100 to-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-navy-600">
          MyHealth Ally is a patient engagement platform that assists you in understanding and navigating your healthcare. 
          MyHealth Ally is not your doctor and does not provide medical diagnosis, treatment, or prescriptions. 
          Always consult with your healthcare provider for medical decisions.
        </p>
      </div>
    </div>
  );
}
