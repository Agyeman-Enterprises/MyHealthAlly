'use client';

interface EmergencyDisclaimerProps {
  variant?: 'banner' | 'compact' | 'modal';
  showCallButton?: boolean;
  className?: string;
}

export function EmergencyDisclaimer({ 
  variant = 'banner', 
  showCallButton = true,
  className = '' 
}: EmergencyDisclaimerProps) {
  const handleCall911 = () => {
    window.location.href = 'tel:911';
  };

  if (variant === 'compact') {
    return (
      <div className={`text-xs text-gray-500 ${className}`}>
        <span className="font-medium">Not for emergencies.</span> If you&apos;re experiencing a medical emergency, call 911.
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-800">Is this an emergency?</h3>
            <p className="text-sm text-red-700 mt-1">
              If you are experiencing chest pain, difficulty breathing, severe bleeding, 
              or any life-threatening symptoms, call 911 immediately.
            </p>
            <p className="text-sm text-red-700 mt-2">
              This messaging service is not monitored 24/7 and is not for emergencies.
            </p>
            {showCallButton && (
              <button
                onClick={handleCall911}
                className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call 911
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default banner variant
  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-xl p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Office Hours:</span> Messages are typically responded to within 24-48 hours during business hours.
          </p>
          <p className="text-sm text-amber-700 mt-1">
            <span className="font-semibold">⚠️ Not for emergencies.</span> If you&apos;re experiencing a medical emergency, 
            go to your nearest emergency room or call 911.
          </p>
        </div>
        {showCallButton && (
          <button
            onClick={handleCall911}
            className="flex-shrink-0 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            911
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Hours of operation info
 */
interface OfficeHoursProps {
  timezone?: string;
  className?: string;
}

export function OfficeHours({ timezone = 'ChST (Guam)', className = '' }: OfficeHoursProps) {
  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-xl p-4 ${className}`}>
      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Office Hours
      </h3>
      <div className="text-sm text-gray-600 space-y-1">
        <p><span className="font-medium">Monday - Friday:</span> 9:00 AM - 5:00 PM {timezone}</p>
        <p><span className="font-medium">Saturday - Sunday:</span> Closed</p>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        Messages received outside office hours will be addressed on the next business day.
      </p>
    </div>
  );
}

/**
 * Confirmation dialog before sending message
 */
interface MessageConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onEmergency: () => void;
}

export function MessageConfirmation({ isOpen, onConfirm, onCancel }: MessageConfirmationProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-fade-in">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Before you send...</h2>
        
        <EmergencyDisclaimer variant="modal" showCallButton={true} className="mb-4" />
        
        <p className="text-sm text-gray-600 mb-6">
          By sending this message, you understand that this is not an emergency service 
          and responses may take 24-48 hours during business hours.
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className="w-full px-4 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            I understand, send my message
          </button>
          <button
            onClick={onCancel}
            className="w-full px-4 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
