'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providerApiClient, WorkItem } from '@/lib/api/provider-client';
import { format } from 'date-fns';
import Link from 'next/link';

export default function ProviderWorkItemsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    type: 'all' as string,
    status: 'all' as string,
    urgency: 'all' as string,
  });

  const { data: workItems, isLoading } = useQuery<WorkItem[]>({
    queryKey: ['provider-work-items', filters],
    queryFn: () => providerApiClient.getWorkItems({
      type: filters.type !== 'all' ? filters.type : undefined,
      status: filters.status !== 'all' ? filters.status : undefined,
      urgency: filters.urgency !== 'all' ? filters.urgency : undefined,
      limit: 100,
    }),
    refetchInterval: 30000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ workItemId, status }: { workItemId: string; status: string }) =>
      providerApiClient.updateWorkItem(workItemId, { status: status as any }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-work-items'] });
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
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'message':
        return '💬';
      case 'refill':
        return '💊';
      case 'vital_alert':
        return '📊';
      case 'appointment':
        return '📅';
      default:
        return '📋';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading work items...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Work Items</h1>
        <div className="text-sm text-gray-500">
          {workItems?.length || 0} items
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All</option>
              <option value="message">Message</option>
              <option value="refill">Refill</option>
              <option value="vital_alert">Vital Alert</option>
              <option value="appointment">Appointment</option>
            </select>
          </div>
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
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
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

      {/* Work Items List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {workItems && workItems.length > 0 ? (
            workItems.map((item) => (
              <li key={item.id} className="hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getTypeIcon(item.type)}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.patient_name || `Patient ${item.patient_id.slice(0, 8)}`}
                        </p>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1 truncate max-w-md">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(item.urgency)}`}>
                        {item.urgency.toUpperCase()}
                      </span>
                      <select
                        value={item.status}
                        onChange={(e) => updateStatusMutation.mutate({ workItemId: item.id, status: e.target.value })}
                        className="text-xs rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <span className="text-sm text-gray-500">
                        {format(new Date(item.created_at), 'MMM d, h:mm a')}
                      </span>
                    </div>
                  </div>
                  {item.assigned_to_name && (
                    <div className="mt-2 text-xs text-gray-500">
                      Assigned to: {item.assigned_to_name}
                    </div>
                  )}
                  {item.due_at && (
                    <div className="mt-1 text-xs text-gray-500">
                      Due: {format(new Date(item.due_at), 'MMM d, h:mm a')}
                      {new Date(item.due_at) < new Date() && item.status !== 'completed' && (
                        <span className="ml-2 text-red-600 font-medium">OVERDUE</span>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-8 text-center text-gray-500">
              No work items found
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
