'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { requestVoiceMessageAudio } from '@/services/patient/voice-messages';
import { AlertTriangle, Headphones } from 'lucide-react';

interface AudioAccessModalProps {
  voiceMessageId: string;
  disabled?: boolean;
}

export function AudioAccessModal({ voiceMessageId, disabled }: AudioAccessModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const handleRequestAudio = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await requestVoiceMessageAudio(voiceMessageId);
      setAudioUrl(response.signedUrl);
      setExpiresAt(response.expiresAt);
    } catch (err: any) {
      setError(err?.message || 'Audio is no longer available.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setAudioUrl(null);
    setExpiresAt(null);
    setError(null);
  };

  return (
    <>
      <Button
        variant="primary"
        fullWidth
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2"
      >
        <Headphones className="w-4 h-4" />
        Request &amp; Play Audio Recording
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Audio access warning</DialogTitle>
            <DialogDescription className="space-y-4 pt-2 text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-myh-danger mt-0.5" />
                <span>
                  This audio may include sensitive information or other voices in the background.
                  Downloading or playing it is at your own risk. If others can access your device, they
                  may hear this recording.
                </span>
              </div>
              <p>
                Audio links expire quickly for your privacy. You can always revisit this page to request a
                new link as long as the recording has not expired.
              </p>
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          {audioUrl ? (
            <div className="space-y-2">
              <audio controls className="w-full" src={audioUrl}>
                Your browser does not support audio playback.
              </audio>
              {expiresAt && (
                <p className="text-xs text-myh-textSoft">
                  Link expires at {new Date(expiresAt).toLocaleTimeString()}.
                </p>
              )}
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleRequestAudio}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Generating link…' : 'Play Audio'}
              </Button>
              <Button variant="ghost" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

