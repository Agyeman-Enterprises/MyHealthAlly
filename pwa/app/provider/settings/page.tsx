'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providerApiClient, PracticeSettings, StaffMember } from '@/lib/api/provider-client';
import { useAuthStore } from '@/lib/store/auth-store';

export default function ProviderSettingsPage() {
  const { role } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'settings' | 'staff' | 'patients'>('settings');

  // Only admins can access settings
  if (role !== 'admin') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  const { data: settings, isLoading: settingsLoading } = useQuery<PracticeSettings>({
    queryKey: ['practice-settings'],
    queryFn: () => providerApiClient.getPracticeSettings(),
  });

  const { data: staff, isLoading: staffLoading } = useQuery<StaffMember[]>({
    queryKey: ['staff'],
    queryFn: () => providerApiClient.getStaff(),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (updates: Partial<PracticeSettings>) =>
      providerApiClient.updatePracticeSettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-settings'] });
    },
  });

  const [settingsForm, setSettingsForm] = useState<Partial<PracticeSettings>>({});
  const [newStaff, setNewStaff] = useState({ name: '', email: '', role: 'staff' });

  if (settingsLoading || staffLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Practice Settings</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Practice Settings
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'staff'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Staff Management
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'patients'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Patient Onboarding
          </button>
        </nav>
      </div>

      {/* Practice Settings Tab */}
      {activeTab === 'settings' && settings && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Practice Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Practice Name
              </label>
              <input
                type="text"
                defaultValue={settings.name}
                onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                defaultValue={settings.email}
                onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                defaultValue={settings.phone}
                onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <input
                type="text"
                defaultValue={settings.timezone}
                onChange={(e) => setSettingsForm({ ...settingsForm, timezone: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div className="pt-4">
              <button
                onClick={() => updateSettingsMutation.mutate(settingsForm)}
                disabled={updateSettingsMutation.isPending}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Management Tab */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          {/* Add Staff */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Staff Member</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="admin">Admin</option>
                  <option value="md">MD</option>
                  <option value="np">NP</option>
                  <option value="ma">MA</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={async () => {
                  await providerApiClient.addStaff(newStaff);
                  queryClient.invalidateQueries({ queryKey: ['staff'] });
                  setNewStaff({ name: '', email: '', role: 'staff' });
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Add Staff
              </button>
            </div>
          </div>

          {/* Staff List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staff && staff.length > 0 ? (
                  staff.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {member.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.role.toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {member.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={async () => {
                            await providerApiClient.removeStaff(member.id);
                            queryClient.invalidateQueries({ queryKey: ['staff'] });
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No staff members
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patient Onboarding Tab */}
      {activeTab === 'patients' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Patient Onboarding</h2>
          <p className="text-sm text-gray-600 mb-4">
            Generate activation tokens for new patients. Tokens can be sent via email or SMS.
          </p>
          <p className="text-sm text-gray-500">
            Patient onboarding functionality will be available after patient management is fully integrated.
          </p>
        </div>
      )}
    </div>
  );
}
