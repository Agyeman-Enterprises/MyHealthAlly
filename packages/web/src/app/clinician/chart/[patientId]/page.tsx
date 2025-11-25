'use client';

import { use, useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { ChartHeader } from './ChartHeader';
import { ChartSidebar } from './ChartSidebar';
import { ChartSummary } from './ChartSummary';
import { ChartTimeline } from './ChartTimeline';
import { ChartNotes } from './ChartNotes';
import { ChartLabsPanel } from './ChartLabsPanel';
import { ChartDocumentsPanel } from './ChartDocumentsPanel';
import { ChartReferralsPanel } from './ChartReferralsPanel';
import { ChartTriageHistory } from './ChartTriageHistory';
import { ScribeNoteComposer } from '@/app/clinician/ScribeMD/ScribeNoteComposer';
import { getChartSummary, getChartTimeline, getChartNotes, getChartLabs, getChartDocuments, getChartReferrals } from '@/services/clinician/chart';
import type { ChartSummary as ChartSummaryType, TimelineEntry, ChartNote } from '@/services/clinician/chart';

type ChartPanel = 'summary' | 'timeline' | 'notes' | 'labs' | 'documents' | 'referrals' | 'triage';

export default function PatientChartPage({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = use(params);
  const [activePanel, setActivePanel] = useState<ChartPanel>('summary');
  const [showScribe, setShowScribe] = useState(false);
  const [selectedEncounterId, setSelectedEncounterId] = useState<string | undefined>();
  
  const [summary, setSummary] = useState<ChartSummaryType | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [notes, setNotes] = useState<ChartNote[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, [patientId]);

  useEffect(() => {
    if (activePanel === 'notes') {
      loadNotes();
    } else if (activePanel === 'labs') {
      loadLabs();
    } else if (activePanel === 'documents') {
      loadDocuments();
    } else if (activePanel === 'referrals') {
      loadReferrals();
    }
  }, [activePanel, patientId, selectedEncounterId]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      const [summaryData, timelineData] = await Promise.all([
        getChartSummary(patientId).catch(() => null),
        getChartTimeline(patientId).catch(() => []),
      ]);
      setSummary(summaryData);
      setTimeline(timelineData);
    } catch (error) {
      console.error('Failed to load chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      const notesData = await getChartNotes(patientId, selectedEncounterId);
      setNotes(notesData);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const loadLabs = async () => {
    try {
      const labsData = await getChartLabs(patientId);
      setLabs(labsData);
    } catch (error) {
      console.error('Failed to load labs:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      const docsData = await getChartDocuments(patientId);
      setDocuments(docsData);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const loadReferrals = async () => {
    try {
      const refsData = await getChartReferrals(patientId);
      setReferrals(refsData);
    } catch (error) {
      console.error('Failed to load referrals:', error);
    }
  };

  const handleTimelineClick = (encounterId: string) => {
    setSelectedEncounterId(encounterId);
    setActivePanel('notes');
  };

  const handleNoteSaved = () => {
    setShowScribe(false);
    loadNotes();
    loadChartData(); // Refresh timeline
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-body text-slate-600">Loading chart...</div>
        </div>
      </PageContainer>
    );
  }

  if (!summary) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-body text-slate-600">Patient not found</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="py-6">
        <ChartHeader
          patient={summary.demographics}
          onStartNote={() => setShowScribe(true)}
          onCreateOrder={() => setActivePanel('labs')}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <ChartSidebar
              activePanel={activePanel}
              onPanelChange={setActivePanel}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {activePanel === 'summary' && <ChartSummary summary={summary} />}
            {activePanel === 'timeline' && (
              <ChartTimeline
                timeline={timeline}
                onEncounterClick={handleTimelineClick}
              />
            )}
            {activePanel === 'notes' && (
              <ChartNotes
                notes={notes}
                onNewNote={() => setShowScribe(true)}
                loading={activePanel === 'notes' && notes.length === 0}
              />
            )}
            {activePanel === 'labs' && <ChartLabsPanel labs={labs} />}
            {activePanel === 'documents' && <ChartDocumentsPanel documents={documents} />}
            {activePanel === 'referrals' && <ChartReferralsPanel referrals={referrals} />}
          </div>
        </div>

        {/* ScribeMD Composer */}
        {showScribe && (
          <ScribeNoteComposer
            patientId={patientId}
            encounterId={selectedEncounterId}
            onClose={() => setShowScribe(false)}
            onSave={handleNoteSaved}
          />
        )}
      </div>
    </PageContainer>
  );
}

