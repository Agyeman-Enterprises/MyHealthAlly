'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RequirePractice } from '@/components/RequirePractice';

export default function CalendarPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showTimePicker, setShowTimePicker] = useState(false);

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  const today = new Date();
  const month = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  const handleDateClick = (day: number) => {
    if (day < 1 || day > 31) return;
    setSelectedDate(day);
    setShowTimePicker(true);
    setSelectedTime('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirmAppointment = () => {
    if (!selectedDate || !selectedTime) return;
    
    // Calculate the actual date - handle month boundaries correctly
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    let targetMonth = currentMonth;
    let targetYear = currentYear;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    if (selectedDate > daysInMonth) {
      // This is next month
      targetMonth = currentMonth + 1;
      if (targetMonth > 11) {
        targetMonth = 0;
        targetYear = currentYear + 1;
      }
    }
    
    const dateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    router.push(`/appointments/request?date=${dateStr}&time=${selectedTime}`);
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        slots.push({ value: timeStr, display: displayTime });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  function CalendarPageInner() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-navy-600">{month}</h1>
          <Button variant="primary" onClick={() => router.push('/appointments/request')}>+ Request Appointment</Button>
        </div>

        <Card className="mb-6">
          <div className="grid grid-cols-7 gap-1 text-center mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-xs font-medium text-gray-500 py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - today.getDay() + 1;
              const isToday = day === today.getDate();
              const hasAppt = [3, 5].includes(day);
              const isSelected = selectedDate === day;
              return (
                <button
                  key={i}
                  onClick={() => handleDateClick(day)}
                  className={`aspect-square p-1 text-center text-sm rounded-lg transition-all ${
                    day < 1 || day > 31 ? 'text-gray-300 cursor-default' :
                    isSelected ? 'bg-primary-600 text-white font-bold ring-2 ring-primary-300' :
                    isToday ? 'bg-primary-500 text-white font-bold hover:bg-primary-600' :
                    hasAppt ? 'bg-primary-100 text-primary-700 font-medium hover:bg-primary-200' : 
                    'hover:bg-gray-100 cursor-pointer'
                  }`}
                  disabled={day < 1 || day > 31}
                >
                  {day > 0 && day <= 31 ? day : ''}
                  {hasAppt && day > 0 && day <= 31 && <div className="w-1 h-1 bg-primary-500 rounded-full mx-auto mt-0.5" />}
                </button>
              );
            })}
          </div>
          
          {showTimePicker && selectedDate && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-medium text-navy-600 mb-3">
                Select time for {month} {selectedDate}
              </h3>
              <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.value}
                    onClick={() => handleTimeSelect(slot.value)}
                    className={`p-2 rounded-lg text-sm transition-all ${
                      selectedTime === slot.value
                        ? 'bg-primary-500 text-white font-medium'
                        : 'bg-white border border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    {slot.display}
                  </button>
                ))}
              </div>
              {selectedTime && (
                <div className="mt-4 flex gap-3">
                  <Button variant="primary" className="flex-1" onClick={handleConfirmAppointment}>
                    Request Appointment at {timeSlots.find(s => s.value === selectedTime)?.display}
                  </Button>
                  <Button variant="outline" onClick={() => { setShowTimePicker(false); setSelectedDate(null); setSelectedTime(''); }}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-navy-600 mb-3">Upcoming Appointments</h2>
          <div className="space-y-2">
            <div className="p-3 bg-primary-50 rounded-xl">
              <p className="font-medium text-navy-600">Jan 3 - Lab Work</p>
              <p className="text-sm text-gray-600">8:30 AM • Lab Center</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-xl">
              <p className="font-medium text-navy-600">Jan 5 - Follow-up Visit</p>
              <p className="text-sm text-gray-600">10:00 AM • Dr. Smith • Main Office</p>
            </div>
          </div>
        </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <RequirePractice featureName="Appointments">
      <CalendarPageInner />
    </RequirePractice>
  );
}
