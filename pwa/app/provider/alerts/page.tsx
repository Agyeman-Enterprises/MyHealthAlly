'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAlerts } from '@/lib/supabase/queries';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { DisclaimerBanner } from '@/components/governance/DisclaimerBanner';
import { Header } from '@/components/layout/Header';

export default function ProviderAlertsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: 'active' as string,
    severity: 'all' as string,
  });

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['provider-alerts', filters],
    queryFn: () => {
      const queryParams: { status?: string; severity?: string; limit: number } = { limit: 100 };
      if (filters.status !== 'all') {
        queryParams.status = filters.status;
      }
      if (filters.severity !== 'all') {
        queryParams.severity = filters.severity;
      }
      return getAlerts(queryParams);
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('alerts')
        .update({
          acknowledged_at: new Date().toISOString(),
          assigned_to_user_id: user.id,
          status: 'active', // Keep active until resolved
        })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-alerts'] });
    },
  });

  const resolveAlertMutation = useMutation({
    mutationFn: async ({ alertId }: { alertId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('alerts')
        .update({
          resolved_at: new Date().toISOString(),
          status: 'resolved',
        })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-alerts'] });
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vital_alert':
        return '📊';
      case 'medication':
        return '💊';
      case 'message':
        return '💬';
      case 'appointment':
        return '📅';
      default:
        return '⚠️';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
        <Header title="Alerts" />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading alerts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      <Header title="Patient Alerts" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DisclaimerBanner type="standard" className="mb-6" />

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Alerts</h1>
          <p className="text-gray-600">
            Critical alerts requiring immediate attention from your care team
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
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
                <option value="active">Active</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {alerts && alerts.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {alerts.map((alert) => {
                const patientName = alert.patients
                  ? `${alert.patients.first_name} ${alert.patients.last_name}`
                  : `Patient ${alert.patient_id.slice(0, 8)}`;

                type TriggerData = {
                  vital_type?: string;
                  value?: string | number | null;
                  value2?: string | number | null;
                  recommendation?: string;
                  notes?: string | null;
                };
                const triggerData = (alert.trigger_data || {}) as TriggerData;
                const isAcknowledged = alert.acknowledged_at !== null;
                const isResolved = alert.status === 'resolved';

                return (
                  <li key={alert.id} className={`hover:bg-gray-50 ${isResolved ? 'opacity-60' : ''}`}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <span className="text-2xl mt-1">{getTypeIcon(alert.type)}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-medium text-gray-900">
                                {alert.title || alert.type}
                              </h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                                {alert.severity.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {patientName}
                            </p>
                            <p className="text-sm text-gray-700 mb-2">
                              {alert.message}
                            </p>
                            {triggerData && (
                              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-2">
                                {triggerData.vital_type && (
                                  <div>
                                    <strong>Vital:</strong> {triggerData.vital_type} = {triggerData.value}
                                    {triggerData.value2 && `/${triggerData.value2}`}
                                  </div>
                                )}
                                {triggerData.recommendation && (
                                  <div className="mt-1">
                                    <strong>Recommendation:</strong> {triggerData.recommendation}
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>Created: {format(new Date(alert.created_at), 'MMM d, h:mm a')}</span>
                              {isAcknowledged && (
                                <span className="text-green-600">✓ Acknowledged</span>
                              )}
                              {isResolved && (
                                <span className="text-blue-600">✓ Resolved</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {!isAcknowledged && !isResolved && (
                            <button
                              onClick={() => acknowledgeAlertMutation.mutate(alert.id)}
                              disabled={acknowledgeAlertMutation.isPending}
                              className="px-3 py-1 text-xs font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
                            >
                              Acknowledge
                            </button>
                          )}
                          {!isResolved && (
                            <button
                              onClick={() => resolveAlertMutation.mutate({ alertId: alert.id })}
                              disabled={resolveAlertMutation.isPending}
                              className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              No alerts found
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
