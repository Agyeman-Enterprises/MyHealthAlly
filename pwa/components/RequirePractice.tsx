/**
 * RequirePractice Gate Component
 * 
 * Wraps clinical routes to ensure patient is attached to a practice.
 * Shows locked panel with CTA if not attached.
 * 
 * Uses getCurrentUserAndPatient() to get attachment state from DB (not Zustand).
 */

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { getCurrentUserAndPatient } from '@/lib/supabase/queries-settings';

type Props = {
  children: React.ReactNode;
  featureName?: string; // e.g. "Messages", "Labs"
};

export function RequirePractice({ children, featureName = 'this feature' }: Props) {
  const patientId = useAuthStore((s) => s.patientId);
  const user = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(true);
  const [attached, setAttached] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      // No patientId → cannot be attached
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
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading patient attachment status:', err);
        if (mounted) {
          setAttached(false);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [patientId, user]);

  if (loading) return null;

  if (!attached) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Connect to a Care Team to unlock {featureName}</h1>
          <p className="mt-2 text-sm text-gray-600">
            Medical care is delivered by licensed clinicians. Connect to unlock messaging, labs, visits,
            and treatment.
          </p>

          <div className="mt-4 flex gap-3">
            <Link
              href="/connect"
              className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Connect to a Care Team
            </Link>
            <Link
              href="/education"
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium"
            >
              Browse Education
            </Link>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Not a diagnosis. If you have severe symptoms, seek emergency care.
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
