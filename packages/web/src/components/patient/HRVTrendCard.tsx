'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export type TrendPoint = {
  date: string; // ISO string for chart
  value: number; // HRV ms, HR, etc.
};

export type HRVTrendCardProps = {
  title?: string; // "Recovery (HRV)"
  statusLabel?: string; // "In a healthy range"
  points: TrendPoint[]; // from /api/patient/analytics.hrvTrend
};

export function HRVTrendCard(props: HRVTrendCardProps) {
  const { title = 'Recovery (HRV)', statusLabel = 'In a healthy range', points = [] } = props;

  // Format data for chart
  const chartData = points.map((point) => ({
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: Math.round(point.value),
    fullDate: point.date,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <TrendingUp className="w-5 h-5 text-myh-primary" />
        </div>
        <p className="text-sm text-myh-textSoft mt-1">{statusLabel}</p>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'HRV (ms)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                  formatter={(value: number) => [`${value} ms`, 'HRV']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  dot={{ fill: '#14b8a6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-myh-textSoft">
            <p>No HRV data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

