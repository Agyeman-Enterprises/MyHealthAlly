'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, MessageResponse, SymptomScreenResult } from '@/lib/api/solopractice-client';
import { format } from 'date-fns';

export default function MessageThreadPage() {
  const router = useRouter();
  const params = useParams();
  const threadId = params.id as string;
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();

  const [messageText, setMessageText] = useState('');
  const [showSymptomScreen, setShowSymptomScreen] = useState(false);
  const [symptomScreen, setSymptomScreen] = useState<SymptomScreenResult>({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', threadId],
    queryFn: () => apiClient.getThreadMessages(threadId),
    enabled: isAuthenticated && !!threadId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (request: { body: string; symptom_screen?: SymptomScreenResult }) =>
      apiClient.sendMessage(threadId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', threadId] });
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      setMessageText('');
      setShowSymptomScreen(false);
    },
  });

  const handleSend = () => {
    if (!messageText.trim()) return;

    // Check if after hours (simplified - in production, check actual time)
    const isAfterHours = false; // TODO: Check practice hours

    if (isAfterHours) {
      setShowSymptomScreen(true);
    } else {
      sendMessageMutation.mutate({ body: messageText });
    }
  };

  const handleSendWithSymptoms = () => {
    sendMessageMutation.mutate({
      body: messageText,
      symptom_screen: symptomScreen,
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  const response = sendMessageMutation.data;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="text-primary-600 hover:text-primary-700 mb-4"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages List */}
        <div className="space-y-4 mb-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            </div>
          ) : messages && messages.length > 0 ? (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No messages yet
            </div>
          )}
        </div>

        {/* Response Status */}
        {response && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              response.status === 'sent'
                ? 'bg-green-50 text-green-800'
                : response.status === 'after_hours_deferred'
                ? 'bg-yellow-50 text-yellow-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {response.status === 'sent' && <p>Message sent successfully</p>}
            {response.status === 'after_hours_deferred' && (
              <div>
                <p className="font-semibold">Message received after hours</p>
                {response.next_open_at && (
                  <p className="text-sm mt-1">
                    Will be reviewed at {format(new Date(response.next_open_at), 'PPp')}
                  </p>
                )}
              </div>
            )}
            {response.status === 'blocked' && (
              <div>
                <p className="font-semibold">Message blocked</p>
                {response.reason && <p className="text-sm mt-1">{response.reason}</p>}
                {response.action === 'redirect_emergency' && (
                  <button
                    onClick={() => window.location.href = 'tel:911'}
                    className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md"
                  >
                    Call 911
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Symptom Screen */}
        {showSymptomScreen && (
          <SymptomScreenModal
            symptomScreen={symptomScreen}
            setSymptomScreen={setSymptomScreen}
            onComplete={handleSendWithSymptoms}
            onCancel={() => setShowSymptomScreen(false)}
          />
        )}

        {/* Message Input */}
        <div className="bg-white rounded-lg shadow p-4">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSend}
              disabled={!messageText.trim() || sendMessageMutation.isPending}
              className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {sendMessageMutation.isPending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function MessageBubble({ message }: { message: MessageResponse }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-gray-900">{message.content}</p>
      <p className="text-xs text-gray-500 mt-2">
        {format(new Date(message.created_at), 'PPp')}
      </p>
      {message.status === 'after_hours_deferred' && (
        <div className="mt-2 text-sm text-yellow-600">
          ⏰ Received after hours
        </div>
      )}
      {message.status === 'blocked' && (
        <div className="mt-2 text-sm text-red-600">
          ⛔ {message.reason || 'Message blocked'}
        </div>
      )}
    </div>
  );
}

function SymptomScreenModal({
  symptomScreen,
  setSymptomScreen,
  onComplete,
  onCancel,
}: {
  symptomScreen: SymptomScreenResult;
  setSymptomScreen: (screen: SymptomScreenResult) => void;
  onComplete: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold mb-4">Emergency Symptoms Check</h2>
        <p className="text-gray-600 mb-6">
          Please answer these questions to help us determine if your message requires immediate attention.
        </p>

        <div className="space-y-4">
          {[
            { key: 'has_chest_pain', label: 'Chest pain or pressure' },
            { key: 'has_shortness_of_breath', label: 'Shortness of breath or difficulty breathing' },
            { key: 'has_severe_bleeding', label: 'Severe bleeding that won\'t stop' },
            { key: 'has_severe_allergic_reaction', label: 'Severe allergic reaction' },
            { key: 'has_loss_of_consciousness', label: 'Loss of consciousness or fainting' },
            { key: 'has_severe_burn', label: 'Severe burn' },
            { key: 'has_severe_head_injury', label: 'Severe head injury' },
            { key: 'has_severe_abdominal_pain', label: 'Severe abdominal pain' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={symptomScreen[key as keyof SymptomScreenResult] as boolean || false}
                onChange={(e) =>
                  setSymptomScreen({ ...symptomScreen, [key]: e.target.checked })
                }
                className="w-4 h-4 text-primary-600"
              />
              <span>{label}</span>
            </label>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Other emergency symptoms (optional)
            </label>
            <textarea
              value={symptomScreen.other_emergency_symptoms || ''}
              onChange={(e) =>
                setSymptomScreen({ ...symptomScreen, other_emergency_symptoms: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-4 py-2"
              rows={3}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onComplete}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
