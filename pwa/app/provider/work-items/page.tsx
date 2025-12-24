'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTasks, updateTask } from '@/lib/supabase/queries';
import { format } from 'date-fns';
import Link from 'next/link';
import { DisclaimerBanner } from '@/components/governance/DisclaimerBanner';

export default function ProviderWorkItemsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    category: 'all' as string,
    status: 'all' as string,
    priority: 'all' as string,
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['provider-work-items', filters],
    queryFn: () => getTasks({
      status: filters.status !== 'all' ? filters.status : undefined,
      priority: filters.priority !== 'all' ? filters.priority : undefined,
      category: filters.category !== 'all' ? filters.category : undefined,
      limit: 100,
    }),
    refetchInterval: 30000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      updateTask(taskId, { status: status as any }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-work-items'] });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-yellow-100 text-yellow-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'patient_outreach':
        return '💬';
      case 'medication':
        return '💊';
      case 'vital_check':
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
      <DisclaimerBanner type="standard" className="mb-6" />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Work Items</h1>
        <div className="text-sm text-gray-500">
          {tasks?.length || 0} items
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All</option>
              <option value="patient_outreach">Patient Outreach</option>
              <option value="medication">Medication</option>
              <option value="vital_check">Vital Check</option>
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
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
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
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Work Items List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {tasks && tasks.length > 0 ? (
            tasks.map((task) => {
              const patientName = task.patients
                ? `${task.patients.first_name} ${task.patients.last_name}`
                : task.patient_id ? `Patient ${task.patient_id.slice(0, 8)}` : 'No patient';
              
              return (
                <li key={task.id} className="hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getCategoryIcon(task.category)}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {task.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {patientName}
                          </p>
                          {task.description && (
                            <p className="text-sm text-gray-500 mt-1 truncate max-w-md">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                        <select
                          value={task.status}
                          onChange={(e) => updateStatusMutation.mutate({ taskId: task.id, status: e.target.value })}
                          className="text-xs rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <span className="text-sm text-gray-500">
                          {format(new Date(task.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </div>
                    {task.due_at && (
                      <div className="mt-1 text-xs text-gray-500">
                        Due: {format(new Date(task.due_at), 'MMM d, h:mm a')}
                        {new Date(task.due_at) < new Date() && task.status !== 'completed' && (
                          <span className="ml-2 text-red-600 font-medium">OVERDUE</span>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })
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
