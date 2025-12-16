'use client';

import { useQuery } from '@tanstack/react-query';
import { providerApiClient, DashboardStats } from '@/lib/api/provider-client';
import { format } from 'date-fns';

export default function ProviderDashboardPage() {
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['provider-dashboard-stats'],
    queryFn: () => providerApiClient.getDashboardStats(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading dashboard. Please try again.</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Last updated: {format(new Date(), 'PPpp')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Messages Stats */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Messages</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.messages.total}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-gray-500">New:</span>
                <span className="ml-1 font-medium text-gray-900">{stats.messages.new}</span>
              </div>
              <div>
                <span className="text-gray-500">In Progress:</span>
                <span className="ml-1 font-medium text-gray-900">{stats.messages.in_progress}</span>
              </div>
              <div>
                <span className="text-gray-500">Overdue:</span>
                <span className="ml-1 font-medium text-red-600">{stats.messages.overdue}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Work Items Stats */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Work Items</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.work_items.total}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-gray-500">New:</span>
                <span className="ml-1 font-medium text-gray-900">{stats.work_items.new}</span>
              </div>
              <div>
                <span className="text-gray-500">In Progress:</span>
                <span className="ml-1 font-medium text-gray-900">{stats.work_items.in_progress}</span>
              </div>
              <div>
                <span className="text-gray-500">Overdue:</span>
                <span className="ml-1 font-medium text-red-600">{stats.work_items.overdue}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Patients Stats */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Patients</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.patients.total}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Active:</span>
                <span className="ml-1 font-medium text-gray-900">{stats.patients.active}</span>
              </div>
              <div>
                <span className="text-gray-500">New This Month:</span>
                <span className="ml-1 font-medium text-gray-900">{stats.patients.new_this_month}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SLA Stats */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">SLA Status</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.sla.on_time}% On Time
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">At Risk:</span>
                <span className="ml-1 font-medium text-yellow-600">{stats.sla.at_risk}</span>
              </div>
              <div>
                <span className="text-gray-500">Overdue:</span>
                <span className="ml-1 font-medium text-red-600">{stats.sla.overdue}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Urgency Breakdown */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Message Urgency */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Message Urgency</h3>
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm text-gray-700">Red (Urgent)</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.messages.by_urgency.red}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span className="text-sm text-gray-700">Yellow (Moderate)</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.messages.by_urgency.yellow}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm text-gray-700">Green (Routine)</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.messages.by_urgency.green}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Work Items by Type */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Work Items by Type</h3>
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Messages</span>
                <span className="text-sm font-medium text-gray-900">{stats.work_items.by_type.message}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Refills</span>
                <span className="text-sm font-medium text-gray-900">{stats.work_items.by_type.refill}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Vital Alerts</span>
                <span className="text-sm font-medium text-gray-900">{stats.work_items.by_type.vital_alert}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Appointments</span>
                <span className="text-sm font-medium text-gray-900">{stats.work_items.by_type.appointment}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
