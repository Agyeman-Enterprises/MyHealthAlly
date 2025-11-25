'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface CloseTaskModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (actionNote: string) => Promise<void>;
  taskId: string;
  patientName?: string;
  loading?: boolean;
}

export function CloseTaskModal({ open, onClose, onConfirm, taskId, patientName, loading }: CloseTaskModalProps) {
  const [actionNote, setActionNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!actionNote.trim() || actionNote.trim().length < 3) {
      setError('Action note is required (minimum 3 characters)');
      return;
    }

    setError(null);
    try {
      await onConfirm(actionNote.trim());
      setActionNote('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to close task');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" style={{ backgroundColor: 'var(--color-surface)' }}>
        <DialogHeader>
          <DialogTitle className="text-h3" style={{ color: 'var(--color-textPrimary)' }}>
            Close Triage Task
          </DialogTitle>
          <DialogDescription style={{ color: 'var(--color-textSecondary)' }}>
            {patientName && `For patient: ${patientName}`}
            <br />
            Please provide an action note describing what was done. This is required for audit purposes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="action-note" className="text-body" style={{ color: 'var(--color-textPrimary)' }}>
              Action Note <span style={{ color: 'var(--color-danger)' }}>*</span>
            </Label>
            <Textarea
              id="action-note"
              value={actionNote}
              onChange={(e) => {
                setActionNote(e.target.value);
                setError(null);
              }}
              placeholder="Describe what action was taken to resolve this task..."
              rows={5}
              className="resize-none"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-textPrimary)',
              }}
            />
            <p className="text-caption" style={{ color: 'var(--color-textSecondary)' }}>
              Minimum 3 characters required. This note will be saved in the audit trail.
            </p>
          </div>

          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-lg"
              style={{
                backgroundColor: 'rgba(225, 85, 85, 0.1)',
                border: '1px solid rgba(225, 85, 85, 0.2)',
                borderRadius: 'var(--radius)',
              }}
            >
              <AlertCircle className="w-4 h-4" style={{ color: 'var(--color-danger)' }} />
              <p className="text-small" style={{ color: 'var(--color-danger)' }}>
                {error}
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!actionNote.trim() || actionNote.trim().length < 3 || loading}
            >
              {loading ? 'Closing...' : 'Close Task'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

