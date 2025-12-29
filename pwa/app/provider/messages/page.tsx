'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMessageThreads } from '@/lib/supabase/queries';
import { format } from 'date-fns';
import Link from 'next/link';
import { DisclaimerBanner } from '@/components/governance/DisclaimerBanner';

export default function ProviderMessagesPage() {
  const [filters, setFilters] = useState({
    status: 'all' as string,
    priority: 'all' as string,
  });

  const { data: threads, isLoading } = useQuery({
    queryKey: ['provider-messages', filters],
    queryFn: () => {
      const queryParams: { status?: string; priority?: string; limit: number } = { limit: 100 };
      if (filters.status !== 'all') {
        queryParams.status = filters.status;
      }
      if (filters.priority !== 'all') {
        queryParams.priority = filters.priority;
      }
      return getMessageThreads(queryParams);
    },
    refetchInterval: 30000,
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'normal':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DisclaimerBanner type="standard" className="mb-6" />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Message Queue</h1>
        <div className="text-sm text-gray-500">
          {threads?.length || 0} threads
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All</option>
              <option value="urgent">Urgent</option>
              <option value="normal">Normal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {threads && threads.length > 0 ? (
            threads.map((thread) => {
              const patientName = thread.patients
                ? `${thread.patients.first_name} ${thread.patients.last_name}`
                : `Patient ${thread.patient_id.slice(0, 8)}`;
              
              return (
                <li key={thread.id} className="hover:bg-gray-50">
                  <Link href={`/provider/messages/${thread.id}`}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {thread.clinician_unread_count > 0 && (
                            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {patientName}
                            </p>
                            <p className="text-sm text-gray-500 truncate max-w-md">
                              {thread.last_message_preview || thread.subject || 'No preview'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(thread.priority)}`}>
                            {thread.priority.toUpperCase()}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(thread.status)}`}>
                            {thread.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            {thread.last_message_at ? format(new Date(thread.last_message_at), 'MMM d, h:mm a') : 'No messages'}
                          </span>
                        </div>
                      </div>
                      {thread.clinician_unread_count > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          {thread.clinician_unread_count} unread message{thread.clinician_unread_count !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })
          ) : (
            <li className="px-4 py-8 text-center text-gray-500">
              No messages found
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
