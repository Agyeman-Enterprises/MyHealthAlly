'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/lib/supabase/queries';
import { format } from 'date-fns';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';

export default function ProviderDashboardPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['provider-dashboard-stats'],
    queryFn: () => getDashboardStats(),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
        <Header title="Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
        <Header title="Dashboard" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card variant="elevated" className="border-l-4 border-l-red-500 bg-red-50">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-medium">Error loading dashboard. Please try again.</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      <Header title="Provider Dashboard" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
          <p className="text-gray-600">
            Last updated: {format(new Date(), 'PPpp')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Messages Stats */}
          <Card variant="gradient" className="border-l-4 border-l-primary-500">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-medium text-primary-700 mb-1">Total Messages</h3>
            <p className="text-3xl font-bold text-primary-900 mb-4">{stats.messages.total}</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-primary-600">New:</span>
                <span className="ml-1 font-semibold text-primary-900">{stats.messages.new}</span>
              </div>
              <div>
                <span className="text-primary-600">In Progress:</span>
                <span className="ml-1 font-semibold text-primary-900">{stats.messages.in_progress}</span>
              </div>
              <div>
                <span className="text-red-600">Overdue:</span>
                <span className="ml-1 font-semibold text-red-700">{stats.messages.overdue}</span>
              </div>
            </div>
          </Card>

          {/* Work Items Stats */}
          <Card variant="elevated" className="border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Work Items</h3>
            <p className="text-3xl font-bold text-gray-900 mb-4">{stats.work_items.total}</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-gray-500">New:</span>
                <span className="ml-1 font-semibold text-gray-900">{stats.work_items.new}</span>
              </div>
              <div>
                <span className="text-gray-500">In Progress:</span>
                <span className="ml-1 font-semibold text-gray-900">{stats.work_items.in_progress}</span>
              </div>
              <div>
                <span className="text-red-600">Overdue:</span>
                <span className="ml-1 font-semibold text-red-700">{stats.work_items.overdue}</span>
              </div>
            </div>
          </Card>

          {/* Patients Stats */}
          <Card variant="elevated" className="border-l-4 border-l-green-500">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Patients</h3>
            <p className="text-3xl font-bold text-gray-900 mb-4">{stats.patients.total}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Active:</span>
                <span className="ml-1 font-semibold text-gray-900">{stats.patients.active}</span>
              </div>
              <div>
                <span className="text-gray-500">New This Month:</span>
                <span className="ml-1 font-semibold text-gray-900">{stats.patients.new_this_month}</span>
              </div>
            </div>
          </Card>

          {/* SLA Stats */}
          <Card variant="elevated" className="border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">SLA Status</h3>
            <p className="text-3xl font-bold text-gray-900 mb-4">{stats.sla.on_time}%</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-yellow-600">At Risk:</span>
                <span className="ml-1 font-semibold text-yellow-700">{stats.sla.at_risk}</span>
              </div>
              <div>
                <span className="text-red-600">Overdue:</span>
                <span className="ml-1 font-semibold text-red-700">{stats.sla.overdue}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Urgency Breakdown */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Message Urgency */}
          <Card variant="elevated">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Message Urgency</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-500 mr-3"></div>
                  <span className="font-medium text-gray-900">Red (Urgent)</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.messages.by_urgency.red}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 mr-3"></div>
                  <span className="font-medium text-gray-900">Yellow (Moderate)</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.messages.by_urgency.yellow}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-3"></div>
                  <span className="font-medium text-gray-900">Green (Routine)</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats.messages.by_urgency.green}</span>
              </div>
            </div>
          </Card>

          {/* Work Items by Type */}
          <Card variant="elevated">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Work Items by Type</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="font-medium text-gray-900">Messages</span>
                <span className="text-lg font-bold text-gray-900">{stats.work_items.by_type.message}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="font-medium text-gray-900">Refills</span>
                <span className="text-lg font-bold text-gray-900">{stats.work_items.by_type.refill}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="font-medium text-gray-900">Vital Alerts</span>
                <span className="text-lg font-bold text-gray-900">{stats.work_items.by_type.vital_alert}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="font-medium text-gray-900">Appointments</span>
                <span className="text-lg font-bold text-gray-900">{stats.work_items.by_type.appointment}</span>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
