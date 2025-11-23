'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, Video, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  initialTab?: string;
};

export function StaffVisitRequests({ initialTab = 'walk-ins' }: Props) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await fetchAPI('/visit-requests');
      setRequests(data);
    } catch (error) {
      console.error('Failed to load visit requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const walkIns = requests.filter((r) => r.requestType === 'WALK_IN' && r.status !== 'CANCELLED' && r.status !== 'CONVERTED_TO_VISIT');
  const scheduled = requests.filter((r) => r.requestType === 'SCHEDULED' && r.status !== 'CANCELLED' && r.status !== 'CONVERTED_TO_VISIT');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const renderRequestList = (requestList: any[]) => {
    if (requestList.length === 0) {
      return (
        <div className="text-center py-12 text-myh-textSoft">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-myh-border" />
          <p>No requests</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {requestList.map((request) => (
          <div
            key={request.id}
            className="p-4 border border-myh-border rounded-lg bg-myh-surface hover:border-myh-primary transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-myh-textSoft" />
                  <span className="font-medium text-myh-text">
                    {request.patient?.user?.firstName} {request.patient?.user?.lastName}
                  </span>
                  {request.severity === 'RED' && (
                    <Badge variant="destructive" className="ml-2">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Emergency
                    </Badge>
                  )}
                  {request.severity === 'ORANGE' && (
                    <Badge className="bg-orange-500">Urgent</Badge>
                  )}
                </div>
                <p className="text-sm text-myh-textSoft mb-2">{request.reasonText}</p>
                <div className="flex items-center gap-4 text-xs text-myh-textSoft">
                  {request.visitMode === 'VIRTUAL' ? (
                    <div className="flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      <span>Virtual</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>In-Person</span>
                    </div>
                  )}
                  {request.requestedDate && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(request.requestedDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Button size="sm" onClick={() => handleAssignNow(request.id)}>
                  Assign Now
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleOfferTimes(request.id)}>
                  Offer Times
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleAssignNow = (requestId: string) => {
    // TODO: Implement assign now logic
    console.log('Assign now:', requestId);
  };

  const handleOfferTimes = (requestId: string) => {
    // TODO: Implement offer times logic
    console.log('Offer times:', requestId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visit Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="walk-ins">Walk-Ins ({walkIns.length})</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled ({scheduled.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="walk-ins" className="mt-4">
            {renderRequestList(walkIns)}
          </TabsContent>
          <TabsContent value="scheduled" className="mt-4">
            {renderRequestList(scheduled)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

