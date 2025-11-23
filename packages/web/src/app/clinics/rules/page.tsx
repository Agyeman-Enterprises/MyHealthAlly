'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchAPI } from '@/lib/utils';
import { ClinicalRule } from '@myhealthally/shared';
import { Settings, Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ClinicsRulesPage() {
  const router = useRouter();
  const [rules, setRules] = useState<ClinicalRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ClinicalRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    metric: 'BLOOD_PRESSURE',
    threshold: '',
    enabled: true,
    priority: '5',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadRules();
  }, [router]);

  const loadRules = async () => {
    try {
      const data = await fetchAPI('/rules');
      setRules(data);
    } catch (error) {
      console.error('Failed to load rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      description: '',
      metric: 'BLOOD_PRESSURE',
      threshold: '',
      enabled: true,
      priority: '5',
    });
    setDialogOpen(true);
  };

  const handleEdit = (rule: ClinicalRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      metric: rule.metric,
      threshold: rule.condition.threshold?.toString() || '',
      enabled: rule.enabled,
      priority: rule.priority?.toString() || '5',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const ruleData = {
        name: formData.name,
        description: formData.description,
        metric: formData.metric,
        condition: {
          op: '>' as const,
          threshold: parseFloat(formData.threshold),
        },
        enabled: formData.enabled,
        priority: parseInt(formData.priority),
        windowDays: 7,
        severity: 'warn' as const,
        action: 'alert' as const,
      };

      if (editingRule) {
        await fetchAPI(`/rules/${editingRule.id}`, {
          method: 'PUT',
          body: JSON.stringify(ruleData),
        });
      } else {
        await fetchAPI('/rules', {
          method: 'POST',
          body: JSON.stringify(ruleData),
        });
      }

      setDialogOpen(false);
      loadRules();
    } catch (error) {
      console.error('Failed to save rule:', error);
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    try {
      await fetchAPI(`/rules/${ruleId}`, { method: 'DELETE' });
      loadRules();
    } catch (error) {
      console.error('Failed to delete rule:', error);
    }
  };

  const toggleRule = async (rule: ClinicalRule) => {
    try {
      await fetchAPI(`/rules/${rule.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...rule, enabled: !rule.enabled }),
      });
      loadRules();
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-myh-text">Clinical Rules Engine</h1>
            <p className="text-muted-foreground mt-2">
              Configure automated alerts and actions based on patient metrics
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Rule
          </Button>
        </div>

        {/* Rules List */}
        <div className="grid gap-6">
          {rules.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">No rules configured yet</p>
                <Button onClick={handleCreate}>Create Your First Rule</Button>
              </CardContent>
            </Card>
          ) : (
            rules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle>{rule.name}</CardTitle>
                        <Badge variant={rule.enabled ? 'default' : 'outline'}>
                          {rule.enabled ? 'Active' : 'Disabled'}
                        </Badge>
                        <Badge variant="outline">Priority: {rule.priority}</Badge>
                      </div>
                      <CardDescription>{rule.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRule(rule)}
                      >
                        {rule.enabled ? (
                          <ToggleRight className="w-5 h-5 text-myh-primary" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(rule)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(rule.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Metric</p>
                      <p className="font-medium">{rule.metric}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Threshold</p>
                      <p className="font-medium">{rule.condition.threshold || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Action</p>
                      <p className="font-medium">{rule.action || 'Create Alert'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit Rule' : 'Create New Rule'}</DialogTitle>
            <DialogDescription>
              Configure a clinical rule to automatically monitor patient metrics and trigger actions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Rule Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., High Blood Pressure Alert"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this rule monitors and when it triggers..."
                rows={3}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="metric">Metric Type</Label>
                <Select value={formData.metric} onValueChange={(value: string) => setFormData({ ...formData, metric: value as any })}>
                  <SelectTrigger id="metric">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BLOOD_PRESSURE">Blood Pressure</SelectItem>
                    <SelectItem value="GLUCOSE">Glucose</SelectItem>
                    <SelectItem value="HEART_RATE">Heart Rate</SelectItem>
                    <SelectItem value="OXYGEN_SATURATION">O₂ Saturation</SelectItem>
                    <SelectItem value="WEIGHT">Weight</SelectItem>
                    <SelectItem value="HRV">HRV (Recovery)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="threshold">Threshold Value</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={formData.threshold}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, threshold: e.target.value })}
                  placeholder="e.g., 140"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority (1-10)</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, priority: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="enabled">Rule Enabled</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{editingRule ? 'Update' : 'Create'} Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

