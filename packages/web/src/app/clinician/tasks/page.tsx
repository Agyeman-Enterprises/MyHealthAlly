'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { getTasks } from '@/lib/clinician-demo-data';
import type { ClinicianTask } from '@/lib/clinician-demo-data';
import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function ClinicianTasksPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [patientFilter, setPatientFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('dueDate');
  const [selectedTask, setSelectedTask] = useState<ClinicianTask | null>(null);

  let tasks = getTasks();
  
  if (statusFilter !== 'all') {
    tasks = tasks.filter((t) => t.status === statusFilter);
  }
  if (patientFilter === 'my_panel') {
    tasks = tasks.filter((t) => t.patientId);
  } else if (patientFilter === 'no_patient') {
    tasks = tasks.filter((t) => !t.patientId);
  }

  tasks.sort((a, b) => {
    if (sortBy === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    if (sortBy === 'patient') {
      return (a.patientName || '').localeCompare(b.patientName || '');
    }
    return 0;
  });

  const getPriorityColor = (priority: string): React.CSSProperties => {
    switch (priority) {
      case 'high':
        return { backgroundColor: 'var(--color-danger)', color: '#FFFFFF' };
      case 'medium':
        return { backgroundColor: 'var(--color-warning)', color: '#FFFFFF' };
      default:
        return { backgroundColor: 'var(--color-textMuted)', color: '#FFFFFF' };
    }
  };

  const getStatusColor = (status: string): React.CSSProperties => {
    switch (status) {
      case 'done':
        return { backgroundColor: 'var(--color-success)', color: '#FFFFFF' };
      case 'in_progress':
        return { backgroundColor: 'var(--color-primary)', color: '#FFFFFF' };
      default:
        return { backgroundColor: 'var(--color-background)', color: 'var(--color-textPrimary)' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h1 className="text-h2 font-semibold" style={{ color: 'var(--color-textPrimary)' }}>Tasks & Follow-ups</h1>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40" style={{ backgroundColor: 'var(--color-surface)' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
          <Select value={patientFilter} onValueChange={setPatientFilter}>
            <SelectTrigger className="w-40" style={{ backgroundColor: 'var(--color-surface)' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patients</SelectItem>
              <SelectItem value="my_panel">My Panel</SelectItem>
              <SelectItem value="no_patient">No Patient</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40" style={{ backgroundColor: 'var(--color-surface)' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="patient">Patient Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks Table */}
      <Card style={{ backgroundColor: 'var(--color-surface)' }}>
        <CardContent className="p-0">
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-4 transition-colors cursor-pointer"
                style={{
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-background)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => setSelectedTask(task)}
              >
                <Checkbox checked={task.status === 'done'} />
                <div className="flex-1 grid grid-cols-6 gap-4">
                  <div className="col-span-2">
                    <p className="font-medium text-body" style={{ color: 'var(--color-textPrimary)' }}>{task.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-body" style={{ color: 'var(--color-textPrimary)' }}>
                      {task.patientName || '—'}
                    </p>
                  </div>
                  <div>
                    <Badge variant="outline" className="text-xs">
                      {task.category}
                    </Badge>
                  </div>
                  <div>
                    <Badge style={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.dueDate && (
                      <span className="text-sm text-caption" style={{ color: 'var(--color-textSecondary)' }}>
                        {new Date(task.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                    <Badge style={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Task Detail Sheet */}
      {selectedTask && (
        <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
          <SheetContent style={{ backgroundColor: 'var(--color-surface)' }}>
            <SheetHeader>
              <SheetTitle>{selectedTask.title}</SheetTitle>
              <SheetDescription>
                {selectedTask.patientName && (
                  <Link
                    href={`/clinician/patients/${selectedTask.patientId}`}
                    className="hover:underline"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {selectedTask.patientName}
                  </Link>
                )}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm text-caption mb-1" style={{ color: 'var(--color-textSecondary)' }}>Description</p>
                <p className="text-body" style={{ color: 'var(--color-textPrimary)' }}>
                  {selectedTask.title} - Follow up required for this patient.
                </p>
              </div>
              <div>
                <p className="text-sm text-caption mb-1" style={{ color: 'var(--color-textSecondary)' }}>Created</p>
                <p className="text-body" style={{ color: 'var(--color-textPrimary)' }}>
                  {new Date().toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              {selectedTask.dueDate && (
                <div>
                  <p className="text-sm text-caption mb-1" style={{ color: 'var(--color-textSecondary)' }}>Due Date</p>
                  <p className="text-body" style={{ color: 'var(--color-textPrimary)' }}>
                    {new Date(selectedTask.dueDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Handle mark done
                    setSelectedTask(null);
                  }}
                >
                  Mark Done
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Handle move to in progress
                    setSelectedTask(null);
                  }}
                >
                  Move to In Progress
                </Button>
                {selectedTask.patientId && (
                  <Link href={`/clinician/patients/${selectedTask.patientId}`}>
                    <Button variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Open Chart
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

