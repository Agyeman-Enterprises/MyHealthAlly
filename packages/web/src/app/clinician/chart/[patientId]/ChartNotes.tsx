'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus } from 'lucide-react';
import type { ChartNote } from '@/services/clinician/chart';

interface ChartNotesProps {
  notes: ChartNote[];
  onNewNote: () => void;
  loading?: boolean;
}

export function ChartNotes({ notes, onNewNote, loading }: ChartNotesProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-h3 text-slate-900">
            Clinical Notes
          </CardTitle>
          <Button variant="primary" onClick={onNewNote}>
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-body text-slate-600">Loading notes...</div>
        ) : notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <p className="text-body font-medium text-slate-900">
                      {note.title}
                    </p>
                    <Badge
                      variant="outline"
                      className="text-caption border-slate-200 text-slate-600"
                    >
                      {note.type}
                    </Badge>
                  </div>
                  <span className="text-caption text-slate-600">
                    {new Date(note.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-small mb-2 text-slate-600">
                  {note.author}
                </p>
                <p className="text-body text-slate-900">
                  {note.preview}
                </p>
                {/* Multilingual indicators */}
                {note.noteOriginalLanguage && note.noteOriginalLanguage !== 'en' && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <p className="text-caption text-slate-600">
                      Original language: {note.noteOriginalLanguage.toUpperCase()}
                      {note.noteCanonicalText && ' • Translated to English for charting'}
                    </p>
                    {note.noteOriginalText && (
                      <details className="mt-1">
                        <summary className="text-caption cursor-pointer text-teal-600">
                          View original dictation
                        </summary>
                        <p className="text-small mt-1 italic text-slate-600">
                          {note.noteOriginalText}
                        </p>
                      </details>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-body mb-4 text-slate-600">
              No notes found
            </p>
            <Button variant="primary" onClick={onNewNote}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Note
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

