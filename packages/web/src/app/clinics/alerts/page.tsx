'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchAPI } from '@/lib/utils';
import { getStoredMetaSync } from '@/lib/auth-storage';
import { Alert } from '@myhealthally/shared';
import Link from 'next/link';
import { AlertTriangle, Filter, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function ClinicsAlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [resolveNote, setResolveNote] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const meta = getStoredMetaSync();
    if (!meta?.user) {
      router.push('/login');
      return;
    }
    loadAlerts();
  }, [router]);

  const loadAlerts = useCallback(async () => {
    try {
      const data = await fetchAPI('/alerts');
      setAlerts(data);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterAlerts = useCallback(() => {
    let filtered = alerts;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter((a) => a.severity === severityFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.body.toLowerCase().includes(query) ||
          a.patientId.toLowerCase().includes(query)
      );
    }

    setFilteredAlerts(filtered);
  }, [alerts, statusFilter, severityFilter, searchQuery]);

  useEffect(() => {
    filterAlerts();
  }, [filterAlerts]);

  const handleResolve = async () => {
    if (!selectedAlert) return;
    try {
      await fetchAPI(`/alerts/${selectedAlert.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'RESOLVED', note: resolveNote }),
      });
      setResolveDialogOpen(false);
      setSelectedAlert(null);
      setResolveNote('');
      loadAlerts();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const getBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'error';
      case 'WARNING':
        return 'warning';
      case 'INFO':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Alerts</h1>
          <p className="text-muted-foreground mt-2">Review and manage patient alerts</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="DISMISSED">Dismissed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                  <SelectItem value="INFO">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <Card>
          <CardHeader>
            <CardTitle>All Alerts ({filteredAlerts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No alerts found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="border-b pb-4 last:border-0 hover:bg-muted/50 -mx-4 px-4 py-2 rounded-md transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getBadgeVariant(alert.severity)}>{alert.severity}</Badge>
                          <Badge variant="outline">{alert.status}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(alert.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-semibold text-lg mb-1">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{alert.body}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <Link
                            href={`/clinics/patients/${alert.patientId}`}
                            className="text-teal-600 hover:underline"
                          >
                            View Patient
                          </Link>
                          <span className="text-muted-foreground">
                            Patient ID: {alert.patientId.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                      {alert.status === 'ACTIVE' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAlert(alert);
                            setResolveDialogOpen(true);
                          }}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Alert</DialogTitle>
            <DialogDescription>
              Add a note about how this alert was resolved.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <p className="font-medium mb-1">{selectedAlert?.title}</p>
              <p className="text-sm text-muted-foreground">{selectedAlert?.body}</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note">Resolution Note</Label>
              <Textarea
                id="note"
                placeholder="e.g., Patient BP stabilized after medication adjustment..."
                value={resolveNote}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResolveNote(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolve}>Resolve Alert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

