'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTriageTasks, getTriageTaskLogs, type TriageTask, type TriageTaskLog } from '@/services/triage/tasks';
import { formatRelativeTime, formatDate } from '@/utils/date';
import { AlertTriangle, Clock, User, CheckCircle, Mic } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  ClinicianVoiceMessageDetail,
  getVoiceMessageForTask,
} from '@/services/clinician/voice-messages';
import { VoiceMessagePanel } from '@/components/clinician/VoiceMessagePanel';

interface ChartTriageHistoryProps {
  patientId: string;
}

const severityClasses: Record<string, string> = {
  EMERGENT: 'bg-red-500 text-white',
  URGENT: 'bg-amber-500 text-white',
  ROUTINE: 'bg-emerald-500 text-white',
  DEFAULT: 'bg-slate-400 text-white',
};

const statusClasses: Record<string, string> = {
  COMPLETED: 'bg-emerald-500 text-white',
  IN_PROGRESS: 'bg-teal-600 text-white',
  OPEN: 'bg-slate-100 text-slate-900',
  DEFAULT: 'bg-slate-400 text-white',
};

export function ChartTriageHistory({ patientId }: ChartTriageHistoryProps) {
  const [tasks, setTasks] = useState<TriageTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<TriageTask | null>(null);
  const [taskLogs, setTaskLogs] = useState<TriageTaskLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [voiceDetail, setVoiceDetail] = useState<ClinicianVoiceMessageDetail | null>(null);
  const [voiceDetailLoading, setVoiceDetailLoading] = useState(false);
  const [voiceDetailError, setVoiceDetailError] = useState<string | null>(null);

  useEffect(() => {
    loadTriageHistory();
  }, [patientId]);

  useEffect(() => {
    if (selectedTask) {
      loadTaskLogs(selectedTask.id);
    }
  }, [selectedTask]);

  useEffect(() => {
    if (!selectedTask || selectedTask.sourceType !== 'voice') {
      setVoiceDetail(null);
      setVoiceDetailLoading(false);
      setVoiceDetailError(null);
      return;
    }
    setVoiceDetailLoading(true);
    setVoiceDetailError(null);
    getVoiceMessageForTask(selectedTask.id)
      .then((detail) => setVoiceDetail(detail))
      .catch((error: any) =>
        setVoiceDetailError(error?.message || 'Unable to load voice recording.'),
      )
      .finally(() => setVoiceDetailLoading(false));
  }, [selectedTask?.id, selectedTask?.sourceType]);

  const loadTriageHistory = async () => {
    try {
      setLoading(true);
      const data = await getTriageTasks({ patientId });
      // Sort by openedAt descending (newest first)
      const sorted = data.sort((a, b) => {
        const dateA = new Date(a.openedAt || a.createdAt).getTime();
        const dateB = new Date(b.openedAt || b.createdAt).getTime();
        return dateB - dateA;
      });
      setTasks(sorted);
    } catch (error) {
      console.error('Failed to load triage history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTaskLogs = async (taskId: string) => {
    try {
      const logs = await getTriageTaskLogs(taskId);
      // Sort by timestamp descending (newest first)
      const sorted = logs.sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      setTaskLogs(sorted);
    } catch (error) {
      console.error('Failed to load task logs:', error);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white">
        <CardContent className="p-8 text-center">
          <p className="text-body text-slate-600">Loading triage history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-h3 flex items-center gap-2 text-slate-900">
            <AlertTriangle className="w-5 h-5 text-teal-600" />
            Triage History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length > 0 ? (
            <div className="space-y-4">
              {tasks.map((task) => {
                const severityClass = severityClasses[task.severity] || severityClasses.DEFAULT;
                const statusClass = statusClasses[task.status] || statusClasses.DEFAULT;
                const overdueClass = task.isOverdue ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50 hover:bg-teal-50';
                return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border cursor-pointer transition-colors ${overdueClass}`}
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-body font-medium text-slate-900">
                          {task.intentType.replace(/_/g, ' ')}
                        </p>
                        <Badge className={severityClass}>{task.severity}</Badge>
                        <Badge className={statusClass}>{task.status}</Badge>
                        {task.isOverdue && (
                          <Badge className="bg-red-500 text-white">
                            OVERDUE
                          </Badge>
                        )}
                      </div>
                      {task.sourceType === 'voice' && (
                        <div className="flex items-center gap-1 text-caption mb-1 text-slate-600">
                          <Mic className="w-3 h-3" />
                          Voice recording
                        </div>
                      )}
                      {task.sourceMessage && (
                        <p className="text-small mt-1 text-slate-600">
                          {task.sourceMessage.substring(0, 100)}
                          {task.sourceMessage.length > 100 ? '...' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 pt-3 border-t border-slate-200">
                    <div>
                      <p className="text-caption text-slate-600">Opened</p>
                      <p className="text-small mt-1 text-slate-900">
                        {formatRelativeTime(task.openedAt || task.createdAt)}
                      </p>
                    </div>
                    {task.firstActionAt && (
                      <div>
                        <p className="text-caption text-slate-600">First Action</p>
                        <p className="text-small mt-1 text-slate-900">
                          {formatRelativeTime(task.firstActionAt)}
                        </p>
                      </div>
                    )}
                    {task.handledByUserId && (
                      <div>
                        <p className="text-caption text-slate-600">Handled By</p>
                        <p className="text-small mt-1 text-slate-900">
                          {task.handledByRole || 'Unknown'}
                        </p>
                      </div>
                    )}
                    {task.closedAt && (
                      <div>
                        <p className="text-caption text-slate-600">Closed</p>
                        <p className="text-small mt-1 text-slate-900">
                          {formatRelativeTime(task.closedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-body text-slate-600">
                No triage history found
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Detail Sheet */}
      {selectedTask && (
        <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-white">
            <SheetHeader>
              <SheetTitle className="text-h2 text-slate-900">
                Triage Task Details
              </SheetTitle>
              <SheetDescription className="text-slate-600">
                {selectedTask.intentType.replace(/_/g, ' ')}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Task Info */}
              <div className="space-y-4">
                {selectedTask.isOverdue && (
                  <div className="p-3 rounded-lg flex items-center gap-2 bg-red-50 border border-red-200">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <p className="text-body font-semibold text-red-600">
                      OVERDUE
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-caption text-slate-600">Opened</p>
                    <p className="text-body mt-1 text-slate-900">
                      {formatDate(selectedTask.openedAt || selectedTask.createdAt)}
                    </p>
                    <p className="text-small mt-1 text-slate-600">
                      {formatRelativeTime(selectedTask.openedAt || selectedTask.createdAt)}
                    </p>
                  </div>
                  {selectedTask.firstActionAt && (
                    <div>
                      <p className="text-caption text-slate-600">First Action</p>
                      <p className="text-body mt-1 text-slate-900">
                        {formatDate(selectedTask.firstActionAt)}
                      </p>
                      <p className="text-small mt-1 text-slate-600">
                        {formatRelativeTime(selectedTask.firstActionAt)}
                      </p>
                    </div>
                  )}
                  {selectedTask.handledByUserId && (
                    <div>
                      <p className="text-caption text-slate-600">Handled By</p>
                      <p className="text-body mt-1 text-slate-900">
                        {selectedTask.handledByRole || 'Unknown'}
                      </p>
                    </div>
                  )}
                  {selectedTask.closedAt && (
                    <div>
                      <p className="text-caption text-slate-600">Closed</p>
                      <p className="text-body mt-1 text-slate-900">
                        {formatDate(selectedTask.closedAt)}
                      </p>
                      <p className="text-small mt-1 text-slate-600">
                        {formatRelativeTime(selectedTask.closedAt)}
                      </p>
                    </div>
                  )}
                </div>
                {selectedTask.sourceMessage && (
                  <div>
                    <p className="text-caption mb-2 text-slate-600">Patient Message</p>
                    <div className="p-3 rounded-lg bg-slate-50">
                      <p className="text-body text-slate-900">
                        {selectedTask.sourceMessage}
                      </p>
                    </div>
                  </div>
                )}
                {selectedTask.actionNote && (
                  <div>
                    <p className="text-caption mb-2 text-slate-600">Action Note</p>
                    <div className="p-3 rounded-lg bg-slate-50">
                      <p className="text-body text-slate-900">
                        {selectedTask.actionNote}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {selectedTask.sourceType === 'voice' && (
                <VoiceMessagePanel
                  detail={voiceDetail}
                  loading={voiceDetailLoading}
                  error={voiceDetailError}
                />
              )}

              {/* Audit Log */}
              <div className="space-y-2 border-t pt-4 border-slate-200">
                <p className="text-body font-medium text-slate-900">
                  Activity Log
                </p>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {taskLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg bg-slate-50"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {log.actionType === 'CLOSED' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                          {log.actionType === 'MARKED_OVERDUE' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          {log.actionType === 'FIRST_ACTION' && <Clock className="w-4 h-4 text-teal-600" />}
                          {!['CLOSED', 'MARKED_OVERDUE', 'FIRST_ACTION'].includes(log.actionType) && <User className="w-4 h-4 text-slate-600" />}
                          <p className="text-small font-medium text-slate-900">
                            {log.actionType.replace(/_/g, ' ')}
                          </p>
                        </div>
                        <span className="text-caption text-slate-600">
                          {formatRelativeTime(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-caption mt-1 text-slate-600">
                        {log.actorRole} • {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}

