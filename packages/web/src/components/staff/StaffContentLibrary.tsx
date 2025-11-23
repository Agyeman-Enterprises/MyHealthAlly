'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export function StaffContentLibrary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Library</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-myh-border" />
          <p className="text-sm text-myh-textSoft">Browse and assign educational content to patients</p>
        </div>
      </CardContent>
    </Card>
  );
}

