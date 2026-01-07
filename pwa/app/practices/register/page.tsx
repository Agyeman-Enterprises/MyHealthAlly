/**
 * Practice Registration Page
 * 
 * Allows practices to register to be listed in the MyHealthAlly marketplace
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUserAndPatient } from '@/lib/supabase/queries-settings';

export default function PracticeRegistrationPage() {
  const router = useRouter();
  const { isLoading } = useRequireAuth();
  const [formData, setFormData] = useState({
    practiceId: '',
    name: '',
    description: '',
    specialty: '',
    website: '',
    phone: '',
    email: '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (isLoading) {
    return null;
  }

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.practiceId.trim() || !formData.name.trim()) {
      setError('Practice ID and Name are required');
      return;
    }

    setLoading(true);

    try {
      const { user } = await getCurrentUserAndPatient();
      if (!user) {
        throw new Error('User not found');
      }

      // Check if practice ID already exists
      const { data: existing } = await supabase
        .from('practices')
        .select('id, practice_id')
        .eq('practice_id', formData.practiceId.trim())
        .single();

      if (existing) {
        setError('A practice with this ID already exists. Please use a different practice ID.');
        setLoading(false);
        return;
      }

      // Create practice registration
      const slug = generateSlug(formData.name);
      const address = {
        street1: formData.street1 || null,
        street2: formData.street2 || null,
        city: formData.city || null,
        state: formData.state || null,
        zipCode: formData.zipCode || null,
        country: formData.country || 'USA',
      };

      const { data, error: insertError } = await supabase
        .from('practices')
        .insert({
          practice_id: formData.practiceId.trim(),
          name: formData.name.trim(),
          slug: slug,
          description: formData.description || null,
          specialty: formData.specialty || null,
          website_url: formData.website || null,
          phone: formData.phone || null,
          email: formData.email || null,
          address: address,
          status: 'pending', // Requires admin approval
          is_public: true,
          is_predefined: false,
          registered_by_user_id: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Send email notification to admin (if Resend is configured)
      try {
        await fetch('/api/practices/register-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            practiceName: formData.name.trim(),
            practiceId: formData.practiceId.trim(),
            registeredBy: user.email || 'Unknown',
            email: formData.email || undefined,
          }),
        }).catch((err) => {
          // Log but don't fail - email is optional
          console.error('Failed to send practice registration email:', err);
        });
      } catch (emailErr) {
        // Email failure shouldn't block registration
        console.error('Error sending practice registration email:', emailErr);
      }

      setSuccess(
        'Practice registration submitted successfully! Your practice will be reviewed and approved by our team. ' +
        'You will be notified once it\'s approved and available for patients to select.'
      );

      // Reset form after 3 seconds
      setTimeout(() => {
        router.push('/onboarding/select-practice');
      }, 3000);
    } catch (err) {
      console.error('Error registering practice:', err);
      setError(err instanceof Error ? err.message : 'Failed to register practice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header title="Register Your Practice" showBack />
      
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <h1 className="text-2xl font-bold text-navy-600 mb-2">Register Your Practice</h1>
          <p className="text-gray-600 text-sm">
            Register your practice to be listed in the MyHealthAlly marketplace. 
            Patients will be able to select your practice during onboarding.
          </p>
        </Card>

        {error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-800 text-sm">{error}</p>
          </Card>
        )}

        {success && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <p className="text-green-800 text-sm">{success}</p>
          </Card>
        )}

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Practice ID *
              </label>
              <Input
                type="text"
                value={formData.practiceId}
                onChange={(e) => setFormData({ ...formData, practiceId: e.target.value })}
                placeholder="your-practice-id"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Unique identifier for your practice (e.g., from your EHR system)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Practice Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your Practice Name"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of your practice..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialty
                </label>
                <Input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="e.g., Primary Care, Cardiology"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@practice.com"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://www.practice.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-700 mb-4">Address (Optional)</h3>
              <div className="space-y-4">
                <Input
                  type="text"
                  value={formData.street1}
                  onChange={(e) => setFormData({ ...formData, street1: e.target.value })}
                  placeholder="Street Address"
                  disabled={loading}
                />
                <Input
                  type="text"
                  value={formData.street2}
                  onChange={(e) => setFormData({ ...formData, street2: e.target.value })}
                  placeholder="Suite, Unit, etc. (Optional)"
                  disabled={loading}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                    disabled={loading}
                  />
                  <Input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State"
                    disabled={loading}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="ZIP Code"
                    disabled={loading}
                  />
                  <Input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Country"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your practice registration will be reviewed by our team. 
                Once approved, it will be available for patients to select during onboarding. 
                You will be notified via email when your practice is approved.
              </p>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                disabled={loading || !formData.practiceId.trim() || !formData.name.trim()}
              >
                Submit Registration
              </Button>
            </div>
          </form>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
