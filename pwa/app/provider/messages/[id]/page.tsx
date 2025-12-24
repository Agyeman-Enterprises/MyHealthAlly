'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providerApiClient, ProviderMessage } from '@/lib/api/provider-client';
import { format } from 'date-fns';
import { DisclaimerBanner } from '@/components/governance/DisclaimerBanner';

export default function ProviderMessageDetailPage() {
  const router = useRouter();
  const params = useParams();
  const messageId = params.id as string;
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState('');

  const { data: message, isLoading } = useQuery<ProviderMessage>({
    queryKey: ['provider-message', messageId],
    queryFn: () => providerApiClient.getMessage(messageId),
  });

  const replyMutation = useMutation({
    mutationFn: (body: string) =>
      providerApiClient.replyToMessage(messageId, { body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-message', messageId] });
      queryClient.invalidateQueries({ queryKey: ['provider-messages'] });
      setReplyText('');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) =>
      providerApiClient.updateMessageStatus(messageId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-message', messageId] });
      queryClient.invalidateQueries({ queryKey: ['provider-messages'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading message...</div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Message not found</p>
      </div>
    );
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'red':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    const url = `/api/provider/messages/${messageId}/export?format=${format}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <DisclaimerBanner type="standard" className="mb-6" />
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Messages
        </button>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExport('json')}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            title="Export timeline for legal defense"
          >
            Export JSON
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            title="Export timeline for legal defense"
          >
            Export CSV
          </button>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(message.urgency)}`}>
            {message.urgency.toUpperCase()} PRIORITY
          </span>
          <select
            value={message.status}
            onChange={(e) => updateStatusMutation.mutate(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Message Content */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="border-b border-gray-200 pb-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {message.patient_name || `Patient ${message.patient_id.slice(0, 8)}`}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {format(new Date(message.created_at), 'PPpp')}
              </p>
            </div>
            {message.assigned_to_name && (
              <div className="text-sm text-gray-500">
                Assigned to: <span className="font-medium">{message.assigned_to_name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
        </div>

        {message.attachments && Object.keys(message.attachments).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Attachments</h3>
            <div className="space-y-2">
              {Object.entries(message.attachments).map(([key, value]) => (
                <a
                  key={key}
                  href={value as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  {key}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reply Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Reply</h3>
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          rows={4}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Type your reply..."
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => replyMutation.mutate(replyText)}
            disabled={!replyText.trim() || replyMutation.isPending}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
          </button>
        </div>
      </div>
    </div>
  );
}
