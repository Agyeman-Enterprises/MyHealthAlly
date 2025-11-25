'use client';

import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LabResultCard } from '@/components/widgets/LabCard';
import { useLabOrders, useLabResults } from '@/hooks/useLabs';
import { formatDate } from '@/utils/date';
import { FlaskConical, Clock, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function PatientLabsPage() {
  const { orders, loading: ordersLoading } = useLabOrders();
  const { results, loading: resultsLoading } = useLabResults();

  if (ordersLoading || resultsLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-body text-slate-600">
            Loading...
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="py-6 space-y-6">
        <div>
          <h1 className="text-h1 mb-2">Labs</h1>
          <p className="text-body text-slate-600">
            Lab orders and results
          </p>
        </div>

        <Tabs defaultValue="orders">
          <TabsList>
            <TabsTrigger value="orders">
              <Clock className="w-4 h-4 mr-2" />
              Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="results">
              <CheckCircle className="w-4 h-4 mr-2" />
              Results ({results.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <div className="space-y-4">
              {orders.length > 0 ? (
                orders.map((order: any) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <FlaskConical className="w-5 h-5 text-teal-600" />
                          {order.testName || 'Lab Test'}
                        </CardTitle>
                        <span
                          className={`px-3 py-1 text-caption rounded-lg ${
                            order.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-600'
                              : order.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-body text-slate-600">
                          Ordered: {formatDate(order.orderedAt || order.createdAt)}
                        </p>
                        {order.orderedBy && (
                          <p className="text-body text-slate-600">
                            Ordered by: {order.orderedBy}
                          </p>
                        )}
                        {order.instructions && (
                          <p className="text-body mt-4 text-slate-900">
                            {order.instructions}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FlaskConical className="w-12 h-12 mb-4 text-slate-400" />
                    <p className="text-body text-slate-600">
                      No lab orders
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="results">
            <div className="space-y-4">
              {results.length > 0 ? (
                results.map((result: any) => (
                  <LabResultCard
                    key={result.id}
                    testName={result.testName || 'Lab Test'}
                    value={result.results?.value || 'N/A'}
                    unit={result.results?.unit || ''}
                    referenceRange={result.results?.referenceRange}
                    status={
                      result.results?.status === 'ABNORMAL'
                        ? 'abnormal'
                        : result.results?.status === 'CRITICAL'
                        ? 'critical'
                        : 'normal'
                    }
                    date={formatDate(result.completedAt || result.createdAt)}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="w-12 h-12 mb-4 text-slate-400" />
                    <p className="text-body text-slate-600">
                      No lab results available
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}

