'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Target } from 'lucide-react';

export function StaffCarePlanBuilder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Care Plan Builder</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Target className="w-12 h-12 mx-auto mb-4 text-myh-border" />
          <p className="text-sm text-myh-textSoft mb-4">Create and manage patient care plans</p>
          <PrimaryButton>Create Care Plan</PrimaryButton>
        </div>
      </CardContent>
    </Card>
  );
}

