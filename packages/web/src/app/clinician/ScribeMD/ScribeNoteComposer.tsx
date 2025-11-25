'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { createNote } from '@/services/clinician/chart';
import { X } from 'lucide-react';

interface ScribeNoteComposerProps {
  patientId: string;
  encounterId?: string;
  onClose: () => void;
  onSave: () => void;
}

export function ScribeNoteComposer({ patientId, encounterId, onClose, onSave }: ScribeNoteComposerProps) {
  const [noteType, setNoteType] = useState<string>('SOAP');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await createNote(patientId, {
        encounterId,
        type: noteType,
        title: title.trim(),
        content: content.trim(),
      });
      onSave();
    } catch (err: any) {
      setError(err.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        className="w-full sm:max-w-2xl overflow-y-auto bg-white"
      >
        <SheetHeader>
          <SheetTitle className="text-h2 text-slate-900">
            New Clinical Note
          </SheetTitle>
          <SheetDescription className="text-slate-600">
            Create a new note for this patient. ScribeMD AI integration coming soon.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Note Type */}
          <div className="space-y-2">
            <Label htmlFor="note-type" className="text-body text-slate-900">
              Note Type
            </Label>
            <Select value={noteType} onValueChange={setNoteType}>
              <SelectTrigger id="note-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SOAP">SOAP Note</SelectItem>
                <SelectItem value="H&P">History & Physical</SelectItem>
                <SelectItem value="Consult">Consultation</SelectItem>
                <SelectItem value="Discharge">Discharge Summary</SelectItem>
                <SelectItem value="Progress">Progress Note</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="note-title" className="text-body text-slate-900">
              Title
            </Label>
            <Input
              id="note-title"
              placeholder="Enter note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white border-slate-200 text-slate-900"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="note-content" className="text-body text-slate-900">
              Note Content
            </Label>
            <Textarea
              id="note-content"
              placeholder="Enter note content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="font-mono text-sm bg-white border-slate-200 text-slate-900"
            />
            <p className="text-caption text-slate-600">
              Tip: ScribeMD AI will help generate structured notes automatically in a future update.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600"
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={saving || !title.trim() || !content.trim()}
            >
              Save Draft
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving || !title.trim() || !content.trim()}
            >
              {saving ? 'Saving...' : 'Save & Close'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

