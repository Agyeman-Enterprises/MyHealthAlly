'use client';

import { FileText, Clock, StickyNote, FlaskConical, File, UserCheck, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';

type ChartPanel = 'summary' | 'timeline' | 'notes' | 'labs' | 'documents' | 'referrals' | 'triage';

interface ChartSidebarProps {
  activePanel: ChartPanel;
  onPanelChange: (panel: ChartPanel) => void;
}

const sidebarItems: Array<{ id: ChartPanel; label: string; icon: any }> = [
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'labs', label: 'Labs', icon: FlaskConical },
  { id: 'documents', label: 'Documents', icon: File },
  { id: 'referrals', label: 'Referrals', icon: UserCheck },
  { id: 'triage', label: 'Triage History', icon: AlertTriangle },
];

export function ChartSidebar({ activePanel, onPanelChange }: ChartSidebarProps) {
  return (
    <Card className="bg-white">
      <div className="p-2 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPanelChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-body font-medium transition-colors ${
                isActive ? 'bg-teal-50 text-teal-600' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

