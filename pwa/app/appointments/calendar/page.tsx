'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays } from 'date-fns';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CalendarPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Placeholder for available slots query
  // In production, this would fetch from SoloPractice calendar API
  const { data: slots, isLoading } = useQuery({
    queryKey: ['available-slots', selectedDate],
    queryFn: async () => {
      if (!selectedDate) return [];
      // Placeholder - replace with actual API call
      // GET /api/portal/appointments/available?date=YYYY-MM-DD
      return [];
    },
    enabled: !!selectedDate,
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Fetch available slots for this date
  };

  const handleSlotSelect = (slot: string) => {
    // Navigate to booking confirmation
    router.push(`/appointments/book?date=${format(selectedDate!, 'yyyy-MM-dd')}&time=${slot}`);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 pb-20 md:pb-8">
      <Header title="Available Appointments" showBack />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="elevated" className="p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map((day) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isPast = day < new Date();
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => !isPast && handleDateSelect(day)}
                  disabled={isPast}
                  className={`p-2 rounded-lg text-center ${
                    isSelected
                      ? 'bg-primary-600 text-white'
                      : isPast
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        </Card>

        {selectedDate && (
          <Card variant="elevated" className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Available Times for {format(selectedDate, 'PP')}
            </h3>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
              </div>
            ) : slots && slots.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => handleSlotSelect(slot)}
                    className="px-4 py-2 border-2 border-primary-200 rounded-lg hover:bg-primary-50 hover:border-primary-500 transition-colors"
                  >
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No available slots for this date. Please select another date or request an appointment.
              </p>
            )}
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

