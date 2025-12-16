'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providerApiClient, ProviderMessage } from '@/lib/api/provider-client';
import { format } from 'date-fns';
import Link from 'next/link';

export default function ProviderMessagesPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: 'all' as string,
    urgency: 'all' as string,
  });

  const { data: messages, isLoading } = useQuery<ProviderMessage[]>({
    queryKey: ['provider-messages', filters],
    queryFn: () => providerApiClient.getMessages({
      status: filters.status !== 'all' ? filters.status : undefined,
      urgency: filters.urgency !== 'all' ? filters.urgency : undefined,
      limit: 100,
    }),
    refetchInterval: 30000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ messageId, status }: { messageId: string; status: string }) =>
      providerApiClient.updateMessageStatus(messageId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-messages'] });
    },
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'red':
        return 'bg-red-100 text-red-800';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800';
      case 'green':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Message Queue</h1>
        <div className="text-sm text-gray-500">
          {messages?.length || 0} messages
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
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Urgency
            </label>
            <select
              value={filters.urgency}
              onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All</option>
              <option value="red">Red (Urgent)</option>
              <option value="yellow">Yellow (Moderate)</option>
              <option value="green">Green (Routine)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {messages && messages.length > 0 ? (
            messages.map((message) => (
              <li key={message.id} className="hover:bg-gray-50">
                <Link href={`/provider/messages/${message.id}`}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {!message.read && (
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {message.patient_name || `Patient ${message.patient_id.slice(0, 8)}`}
                          </p>
                          <p className="text-sm text-gray-500 truncate max-w-md">
                            {message.content}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(message.urgency)}`}>
                          {message.urgency.toUpperCase()}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                          {message.status.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(message.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </div>
                    {message.assigned_to_name && (
                      <div className="mt-2 text-xs text-gray-500">
                        Assigned to: {message.assigned_to_name}
                      </div>
                    )}
                    {message.due_at && (
                      <div className="mt-1 text-xs text-gray-500">
                        Due: {format(new Date(message.due_at), 'MMM d, h:mm a')}
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))
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
