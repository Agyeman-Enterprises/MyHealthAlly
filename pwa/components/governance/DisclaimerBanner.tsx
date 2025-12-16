'use client';

interface DisclaimerBannerProps {
  type?: 'standard' | 'emergency' | 'ai-advisory' | 'educational';
  className?: string;
}

const DISCLAIMERS = {
  standard: `MyHealth Ally is a patient engagement platform that assists you in understanding and navigating your healthcare. MyHealth Ally is not your doctor and does not provide medical diagnosis, treatment, or prescriptions. Always consult with your healthcare provider for medical decisions.`,
  emergency: `If you are experiencing a medical emergency, please call 911 immediately. MyHealth Ally cannot provide emergency medical care.`,
  'ai-advisory': `The information provided is for educational purposes only and is not a substitute for professional medical advice. All clinical decisions must be made by your healthcare provider.`,
  educational: `The information provided is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.`,
};

export function DisclaimerBanner({ type = 'standard', className = '' }: DisclaimerBannerProps) {
  const disclaimer = DISCLAIMERS[type];
  const isEmergency = type === 'emergency';

  return (
    <div
      className={`rounded-xl p-4 border-l-4 ${
        isEmergency
          ? 'bg-red-50 border-l-red-500'
          : 'bg-primary-50 border-l-primary-500'
      } ${className}`}
    >
      <div className="flex items-start space-x-3">
        <svg
          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
            isEmergency ? 'text-red-600' : 'text-primary-600'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p
          className={`text-sm font-medium ${
            isEmergency ? 'text-red-900' : 'text-primary-900'
          }`}
        >
          {disclaimer}
        </p>
      </div>
    </div>
  );
}
