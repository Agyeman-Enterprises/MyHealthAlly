'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { getCurrentUserAndPatient } from '@/lib/supabase/queries-settings';

export function useAttachmentStatus() {
  const patientId = useAuthStore((s) => s.patientId);
  const user = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(true);
  const [attached, setAttached] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!patientId || !user) {
        if (mounted) {
          setAttached(false);
          setLoading(false);
        }
        return;
      }

      try {
        const { patient } = await getCurrentUserAndPatient();

        const isAttached =
          patient?.attachment_status === 'ATTACHED' &&
          !!patient?.practice_id;

        if (mounted) {
          setAttached(isAttached);
        }
      } catch (err) {
        console.error('Error loading patient attachment status:', err);
        if (mounted) {
          setAttached(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [patientId, user]);

  return { loading, attached };
}

