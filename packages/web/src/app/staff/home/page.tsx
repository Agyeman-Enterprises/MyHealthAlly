'use client';

import { BuilderPage } from '@/components/builder/BuilderPage';
import { getStaffHomeData } from '@/services/staff/home-data';
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function StaffHomePage() {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStaffHomeData().then((homeData) => {
      setData(homeData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-background p-8">Loading...</div>;
  }

  return (
    <BuilderPage
      model="staff-page"
      urlPath="/staff/home"
      data={data}
    />
  );
}

