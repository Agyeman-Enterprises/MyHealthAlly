'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { fetchAPI } from '@/lib/utils';
import { Languages } from 'lucide-react';

interface LanguagePromptModalProps {
  open: boolean;
  detectedLanguage: string;
  languageName: string;
  onClose: () => void;
  onLanguageSet: () => void;
}

export function LanguagePromptModal({
  open,
  detectedLanguage,
  languageName,
  onClose,
  onLanguageSet,
}: LanguagePromptModalProps) {
  const [saving, setSaving] = useState(false);

  const handleYes = async () => {
    try {
      setSaving(true);
      await fetchAPI('/patients/me/language', {
        method: 'POST',
        body: JSON.stringify({ preferredLanguage: detectedLanguage }),
      });
      onLanguageSet();
      onClose();
    } catch (error) {
      console.error('Failed to set language preference:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleNo = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ backgroundColor: 'var(--color-surface)' }}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Languages className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            <DialogTitle className="text-h3" style={{ color: 'var(--color-textPrimary)' }}>
              Language Preference
            </DialogTitle>
          </div>
          <DialogDescription style={{ color: 'var(--color-textSecondary)' }}>
            We noticed you&apos;re using <strong>{languageName}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <p className="text-body" style={{ color: 'var(--color-textPrimary)' }}>
            Would you like your care plan, messages, and visit summaries in this language?
          </p>
          <div className="flex gap-2 pt-4">
            <Button
              variant="primary"
              onClick={handleYes}
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Saving...' : `Yes, use ${languageName}`}
            </Button>
            <Button
              variant="outline"
              onClick={handleNo}
              disabled={saving}
              className="flex-1"
            >
              No, keep English
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

