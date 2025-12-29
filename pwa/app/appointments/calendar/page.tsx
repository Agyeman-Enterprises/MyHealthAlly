'use client';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CalendarPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  const today = new Date();
  const month = today.toLocaleString('default', { month: 'long', year: 'numeric' });

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
              return (
                <div key={i} className={`aspect-square p-1 text-center text-sm rounded-lg ${
                  day < 1 || day > 31 ? 'text-gray-300' :
                  isToday ? 'bg-primary-500 text-white font-bold' :
                  hasAppt ? 'bg-primary-100 text-primary-700 font-medium' : 'hover:bg-gray-100'
                }`}>
                  {day > 0 && day <= 31 ? day : ''}
                  {hasAppt && day > 0 && day <= 31 && <div className="w-1 h-1 bg-primary-500 rounded-full mx-auto mt-0.5" />}
                </div>
              );
            })}
          </div>
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
