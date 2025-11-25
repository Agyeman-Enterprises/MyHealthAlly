'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCheck, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ChartReferralsPanelProps {
  referrals: any[];
}

export function ChartReferralsPanel({ referrals }: ChartReferralsPanelProps) {
  const getStatusClass = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'sent':
        return 'bg-amber-500 text-white';
      case 'completed':
      case 'accepted':
        return 'bg-emerald-500 text-white';
      case 'cancelled':
      case 'rejected':
        return 'bg-slate-400 text-white';
      default:
        return 'bg-slate-100 text-slate-900';
    }
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-h3 flex items-center gap-2 text-slate-900">
            <UserCheck className="w-5 h-5 text-teal-600" />
            Referrals
          </CardTitle>
          <Link href="/clinician/referrals">
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {referrals.length > 0 ? (
          <div className="space-y-4">
            {referrals.map((referral) => (
              <div
                key={referral.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-body font-medium text-slate-900">
                      {referral.specialty}
                    </p>
                    <p className="text-caption mt-1 text-slate-600">
                      {new Date(referral.createdAt || referral.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  {referral.status && (
                    <Badge className={getStatusClass(referral.status)}>
                      {referral.status}
                    </Badge>
                  )}
                </div>
                {referral.reason && (
                  <p className="text-body mb-2 text-slate-900">
                    {referral.reason}
                  </p>
                )}
                {referral.providerName && (
                  <p className="text-caption text-slate-600">
                    Provider: {referral.providerName}
                  </p>
                )}
                {referral.priority && (
                  <Badge
                    variant="outline"
                    className="mt-2 text-caption border-slate-200 text-slate-600"
                  >
                    Priority: {referral.priority}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <UserCheck className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-body text-slate-600">
              No referrals found
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

