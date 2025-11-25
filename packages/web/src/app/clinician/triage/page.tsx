'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getTriageTasks,
  updateTriageTask,
  getTriageTaskLogs,
  addTriageTaskLog,
  closeTriageTask,
  type TriageTask,
  type TriageTaskLog,
} from '@/services/triage/tasks';
import {
  ClinicianVoiceMessageDetail,
  getVoiceMessageForTask,
} from '@/services/clinician/voice-messages';
import { VoiceMessagePanel } from '@/components/clinician/VoiceMessagePanel';
import { CloseTaskModal } from '@/components/triage/CloseTaskModal';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Calendar, Pill, AlertTriangle, UserCheck, MessageSquare, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatRelativeTime } from '@/utils/date';

type TriageStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type TriageSeverity = 'ROUTINE' | 'URGENT' | 'EMERGENT' | 'UNKNOWN';

export default function ClinicianTriagePage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TriageTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<TriageTask | null>(null);
  const [taskLogs, setTaskLogs] = useState<TriageTaskLog[]>([]);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closingTask, setClosingTask] = useState(false);
  const [voiceDetail, setVoiceDetail] = useState<ClinicianVoiceMessageDetail | null>(null);
  const [voiceDetailLoading, setVoiceDetailLoading] = useState(false);
  const [voiceDetailError, setVoiceDetailError] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, [statusFilter, severityFilter]);

  useEffect(() => {
    if (selectedTask) {
      loadTaskLogs(selectedTask.id);
    }
  }, [selectedTask]);

  useEffect(() => {
    if (!selectedTask || selectedTask.sourceType !== 'voice') {
      setVoiceDetail(null);
      setVoiceDetailError(null);
      setVoiceDetailLoading(false);
      return;
    }
    setVoiceDetailLoading(true);
    setVoiceDetailError(null);
    getVoiceMessageForTask(selectedTask.id)
      .then((detail) => setVoiceDetail(detail))
      .catch((error: any) => {
        setVoiceDetailError(error?.message || 'Unable to load voice recording.');
      })
      .finally(() => setVoiceDetailLoading(false));
  }, [selectedTask?.id, selectedTask?.sourceType]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (severityFilter !== 'all') filters.severity = severityFilter;
      const data = await getTriageTasks(filters);
      setTasks(data);
    } catch (error) {
      console.error('Failed to load triage tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTaskLogs = async (taskId: string) => {
    try {
      const logs = await getTriageTaskLogs(taskId);
      setTaskLogs(logs);
    } catch (error) {
      console.error('Failed to load task logs:', error);
    }
  };

  const handleUpdateTask = async (updates: {
    status?: TriageStatus;
    severity?: TriageSeverity;
    notes?: string;
  }) => {
    if (!selectedTask || !user) return;
    try {
      setUpdating(true);
      const isFirstAction = !selectedTask.firstActionAt;
      await updateTriageTask(selectedTask.id, {
        ...updates,
        ...(isFirstAction && { firstActionAt: new Date().toISOString() }),
      });
      await addTriageTaskLog(selectedTask.id, {
        actionType: isFirstAction ? 'FIRST_ACTION' : updates.severity ? 'SEVERITY_CHANGED' : 'COMMENT_ADDED',
        details: updates.notes || JSON.stringify(updates),
      });

      // TODO: Send notification if MD overrides or MA takes action
      // if (updates.severity && user.role === 'PROVIDER') {
      //   // MD override - notify MA if assigned
      //   if (selectedTask.assignedMAId) {
      //     await sendTriageNotification({
      //       userId: selectedTask.assignedMAId,
      //       taskId: selectedTask.id,
      //       type: 'MD_OVERRIDE',
      //       message: `Clinician changed priority for ${selectedTask.patientName || 'patient'}`,
      //       priority: 'MEDIUM',
      //     });
      //   }
      // } else if (user.role === 'MEDICAL_ASSISTANT') {
      //   // MA action - notify supervising MD
      //   await sendTriageNotification({
      //     userId: selectedTask.supervisingClinicianId,
      //     taskId: selectedTask.id,
      //     type: 'MA_ACTION',
      //     message: `MA updated triage item for ${selectedTask.patientName || 'patient'}`,
      //     priority: 'LOW',
      //   });
      // }

      setNotes('');
      await loadTasks();
      await loadTaskLogs(selectedTask.id);
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseTask = async (actionNote: string) => {
    if (!selectedTask || !user) return;
    try {
      setClosingTask(true);
      const isFirstAction = !selectedTask.firstActionAt;
      await closeTriageTask(selectedTask.id, {
        actionNote,
        handledByUserId: user.id,
        handledByRole: user.role === 'PROVIDER' || user.role === 'ADMIN' ? 'CLINICIAN' : 'MA',
      });
      
      // TODO: Send notification to supervising MD if MA closed it
      // if (user.role === 'MEDICAL_ASSISTANT' && selectedTask.supervisingClinicianId) {
      //   await sendTriageNotification({
      //     userId: selectedTask.supervisingClinicianId,
      //     taskId: selectedTask.id,
      //     type: 'TASK_COMPLETED',
      //     message: `Triage task completed for ${selectedTask.patientName || 'patient'}`,
      //     priority: 'LOW',
      //   });
      // }

      await loadTasks();
      await loadTaskLogs(selectedTask.id);
      setSelectedTask(null);
    } catch (error: any) {
      throw error;
    } finally {
      setClosingTask(false);
    }
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'SYMPTOM_REPORT':
        return AlertTriangle;
      case 'REQUEST_SAME_DAY_APPOINTMENT':
      case 'REQUEST_FUTURE_APPOINTMENT':
        return Calendar;
      case 'REQUEST_REFILL':
        return Pill;
      case 'ADMIN_TASK':
        return FileText;
      default:
        return MessageSquare;
    }
  };

  const severityClasses: Record<string, string> = {
    EMERGENT: 'bg-red-500 text-white',
    URGENT: 'bg-amber-500 text-white',
    ROUTINE: 'bg-emerald-500 text-white',
    UNKNOWN: 'bg-slate-400 text-white',
  };

  const statusClasses: Record<string, string> = {
    OPEN: 'bg-slate-100 text-slate-900',
    IN_PROGRESS: 'bg-teal-600 text-white',
    COMPLETED: 'bg-emerald-500 text-white',
    CANCELLED: 'bg-slate-400 text-white',
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-h2 font-semibold text-slate-900">
            Triage & Supervision
          </h1>
          <p className="text-body mt-1 text-slate-600">
            Review and manage patient requests with MD oversight
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="EMERGENT">Emergent</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
              <SelectItem value="ROUTINE">Routine</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks List */}
      <Card className="bg-white">
        <CardContent className="p-0">
          <div className="divide-y divide-slate-200">
            {loading ? (
              <div className="p-8 text-center">
                <p className="text-body text-slate-600">Loading...</p>
              </div>
            ) : tasks.length > 0 ? (
              tasks.map((task) => {
                const Icon = getIntentIcon(task.intentType);
                return (
                  <div
                    key={task.id}
                    className={`flex items-center gap-4 p-4 transition-colors cursor-pointer ${
                      task.isOverdue ? 'bg-red-50 border-l-4 border-red-500' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => setSelectedTask(task)}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-teal-50"
                    >
                      <Icon className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1 grid grid-cols-6 gap-4">
                      <div>
                        <p className="text-body font-medium text-slate-900">
                          {task.patientName || 'Unknown Patient'}
                        </p>
                        <p className="text-caption mt-1 text-slate-600">
                          {formatRelativeTime(task.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-small text-slate-900">
                          {task.intentType.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div>
                        <Badge className={severityClasses[task.severity] ?? severityClasses.UNKNOWN}>
                          {task.severity}
                        </Badge>
                      </div>
                      <div>
                        <Badge className={statusClasses[task.status] ?? statusClasses.OPEN}>
                          {task.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-small text-slate-600">
                          {task.assignedMAId ? 'MA Assigned' : 'Unassigned'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/clinician/chart/${task.patientId}`}>
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-2" />
                            Chart
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <p className="text-body text-slate-600">No triage tasks found</p>
              </div>
            )}
          </div>
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
                Patient: {selectedTask.patientName || 'Unknown'}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Task Info */}
              <div className="space-y-4">
                <div>
                  <Label className="text-caption text-slate-600">Intent Type</Label>
                  <p className="text-body mt-1 text-slate-900">
                    {selectedTask.intentType.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <Label className="text-caption text-slate-600">Severity</Label>
                    <div className="mt-1">
                      <Badge className={severityClasses[selectedTask.severity] ?? severityClasses.UNKNOWN}>
                        {selectedTask.severity}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-caption text-slate-600">Status</Label>
                    <div className="mt-1">
                      <Badge className={statusClasses[selectedTask.status] ?? statusClasses.OPEN}>
                        {selectedTask.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                {selectedTask.sourceMessage && (
                  <div>
                    <Label className="text-caption text-slate-600">Patient Message</Label>
                    <div className="mt-1 p-3 rounded-lg bg-slate-50">
                      <p className="text-body text-slate-900">
                        {selectedTask.sourceMessage}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-4 border-t border-slate-200 pt-4">
                <div>
                  <Label htmlFor="severity-select" className="text-body text-slate-900">
                    Change Severity
                  </Label>
                  <Select
                    value={selectedTask.severity}
                    onValueChange={(value: TriageSeverity) => handleUpdateTask({ severity: value })}
                  >
                    <SelectTrigger id="severity-select" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ROUTINE">Routine</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                      <SelectItem value="EMERGENT">Emergent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-body text-slate-900">
                    Add Note (for MA or record)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add a note..."
                    rows={3}
                    className="mt-2 bg-white border-slate-200 text-slate-900"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleUpdateTask({ notes })}
                    disabled={!notes.trim() || updating}
                  >
                    Add Note
                  </Button>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Link href={`/clinician/chart/${selectedTask.patientId}`}>
                    <Button variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Open Chart
                    </Button>
                  </Link>
                  {selectedTask.intentType.includes('APPOINTMENT') && (
                    <Button variant="outline">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Appointment
                    </Button>
                  )}
                  <Button variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message Patient
                  </Button>
                  {selectedTask.status !== 'COMPLETED' && (
                    <Button
                      variant="primary"
                      onClick={() => handleUpdateTask({ status: 'COMPLETED' })}
                      disabled={updating}
                    >
                      Mark Completed
                    </Button>
                  )}
                </div>
              </div>

              {selectedTask.sourceType === 'voice' && (
                <VoiceMessagePanel
                  detail={voiceDetail}
                  loading={voiceDetailLoading}
                  error={voiceDetailError}
                />
              )}

              {/* Audit Log */}
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <Label className="text-body font-medium text-slate-900">
                  Activity Log
                </Label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {taskLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2 rounded-lg bg-slate-50"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-small font-medium text-slate-900">
                          {log.actionType.replace(/_/g, ' ')}
                        </p>
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
    </div>
  );
}

