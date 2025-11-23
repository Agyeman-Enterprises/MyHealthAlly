'use client';

import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { fetchAPI } from '@/lib/utils';
import { calculateBMI, getBMICategory } from '@/utils/bmi';
import { Smartphone, Activity, FileText, User, CreditCard, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function PatientProfilePage() {
  const { patient, user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [heightCm, setHeightCm] = useState<number | ''>('');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any>({ excuseNotes: [], referrals: [] });

  useEffect(() => {
    loadProfile();
    loadReferrals();
    loadDocuments();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await fetchAPI('/patients/me');
      setProfile(data);
      if (data.heightCm) setHeightCm(data.heightCm);
      if (data.weightKg) setWeightKg(data.weightKg);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReferrals = async () => {
    try {
      const data = await fetchAPI('/patients/me/referrals');
      setReferrals(data || []);
    } catch (error) {
      console.error('Failed to load referrals:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      const data = await fetchAPI('/patients/me/documents');
      setDocuments(data || { excuseNotes: [], referrals: [] });
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleSaveHeightWeight = async () => {
    if (!heightCm || !weightKg) return;
    setSaving(true);
    try {
      await fetchAPI('/patients/me', {
        method: 'PATCH',
        body: JSON.stringify({
          heightCm: Number(heightCm),
          weightKg: Number(weightKg),
        }),
      });
      await loadProfile();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const bmi = heightCm && weightKg ? calculateBMI(Number(weightKg), Number(heightCm)) : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
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
          <h1 className="text-h1 mb-2">Profile</h1>
          <p className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
            Manage your account and health information
          </p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      value={profile?.user?.firstName || ''}
                      disabled
                    />
                    <Input
                      label="Last Name"
                      value={profile?.user?.lastName || ''}
                      disabled
                    />
                    <Input
                      label="Email"
                      value={profile?.user?.email || ''}
                      disabled
                    />
                    <Input
                      label="Date of Birth"
                      value={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : ''}
                      disabled
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Height & Weight for BMI */}
              <Card>
                <CardHeader>
                  <CardTitle>Height & Weight</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Height (cm)"
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value ? Number(e.target.value) : '')}
                      placeholder="170"
                    />
                    <Input
                      label="Weight (kg)"
                      type="number"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : '')}
                      placeholder="70"
                    />
                  </div>
                  {bmi && (
                    <div className="p-4 border-radius" style={{
                      backgroundColor: 'var(--color-background)',
                      borderRadius: 'var(--radius)',
                    }}>
                      <div className="flex items-center justify-between">
                        <span className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
                          BMI
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-h2" style={{ color: 'var(--color-textPrimary)' }}>
                            {bmi}
                          </span>
                          <span
                            className="px-3 py-1 text-caption border-radius"
                            style={{
                              backgroundColor: bmiCategory?.color + '20',
                              color: bmiCategory?.color,
                              borderRadius: 'var(--radius)',
                            }}
                          >
                            {bmiCategory?.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <Button
                    onClick={handleSaveHeightWeight}
                    disabled={!heightCm || !weightKg || saving}
                  >
                    {saving ? 'Saving...' : 'Save Height & Weight'}
                  </Button>
                </CardContent>
              </Card>

              {/* Connected Devices */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                    Connected Devices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
                    No devices connected
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <CardTitle>Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                {referrals.length > 0 ? (
                  <div className="space-y-4">
                    {referrals.map((ref: any) => (
                      <div
                        key={ref.id}
                        className="p-4 border-radius"
                        style={{
                          backgroundColor: 'var(--color-background)',
                          borderRadius: 'var(--radius)',
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-body font-medium" style={{ color: 'var(--color-textPrimary)' }}>
                              {ref.specialistName || 'Specialist'}
                            </p>
                            <p className="text-caption" style={{ color: 'var(--color-textSecondary)' }}>
                              {ref.specialty}
                            </p>
                          </div>
                          <span
                            className="px-2 py-1 text-caption border-radius"
                            style={{
                              backgroundColor: ref.status === 'COMPLETED' ? 'var(--color-success)' + '20' : 'var(--color-warning)' + '20',
                              color: ref.status === 'COMPLETED' ? 'var(--color-success)' : 'var(--color-warning)',
                              borderRadius: 'var(--radius)',
                            }}
                          >
                            {ref.status}
                          </span>
                        </div>
                        {ref.reason && (
                          <p className="text-body mt-2" style={{ color: 'var(--color-textSecondary)' }}>
                            {ref.reason}
                          </p>
                        )}
                        <p className="text-caption mt-2" style={{ color: 'var(--color-textSecondary)' }}>
                          {new Date(ref.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
                    No referrals
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <div className="space-y-6">
              {/* Excuse Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Medical Excuse Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  {documents.excuseNotes && documents.excuseNotes.length > 0 ? (
                    <div className="space-y-4">
                      {documents.excuseNotes.map((note: any) => (
                        <div
                          key={note.id}
                          className="p-4 border-radius"
                          style={{
                            backgroundColor: 'var(--color-background)',
                            borderRadius: 'var(--radius)',
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-body font-medium" style={{ color: 'var(--color-textPrimary)' }}>
                                {note.type === 'WORK' ? 'Work Excuse' : note.type === 'SCHOOL' ? 'School Excuse' : 'Medical Note'}
                              </p>
                              <p className="text-caption" style={{ color: 'var(--color-textSecondary)' }}>
                                {new Date(note.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {note.documentUrl && (
                              <a href={note.documentUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm">
                                  View PDF
                                </Button>
                              </a>
                            )}
                          </div>
                          {note.reason && (
                            <p className="text-body mt-2" style={{ color: 'var(--color-textSecondary)' }}>
                              {note.reason}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-body" style={{ color: 'var(--color-textSecondary)' }}>
                      No excuse notes
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
