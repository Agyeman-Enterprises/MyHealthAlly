'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VitalCard } from '@/components/specialized/VitalCard';
import { Heart, Gauge, Scale, AlertTriangle, Pill, XCircle } from 'lucide-react';
import type { ChartSummary as ChartSummaryType } from '@/services/clinician/chart';

interface ChartSummaryProps {
  summary: ChartSummaryType;
}

export function ChartSummary({ summary }: ChartSummaryProps) {
  const { demographics, activeProblems, medications, allergies, keyVitals } = summary;

  return (
    <div className="space-y-6">
      {/* Key Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {keyVitals.bloodPressure && (
          <VitalCard
            label="Blood Pressure"
            value={keyVitals.bloodPressure}
            unit="mmHg"
            status="normal"
            lastUpdated={keyVitals.lastUpdated}
          />
        )}
        {keyVitals.heartRate && (
          <VitalCard
            label="Heart Rate"
            value={keyVitals.heartRate}
            unit="bpm"
            status="normal"
            lastUpdated={keyVitals.lastUpdated}
          />
        )}
        {keyVitals.bmi && (
          <VitalCard
            label="BMI"
            value={keyVitals.bmi.toFixed(1)}
            unit=""
            status="normal"
            lastUpdated={keyVitals.lastUpdated}
          />
        )}
      </div>

      {/* Active Problems */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-h3 text-slate-900">
            Active Problems
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeProblems.length > 0 ? (
            <div className="space-y-3">
              {activeProblems.map((problem) => (
                <div
                  key={problem.id}
                  className="p-3 rounded-2xl bg-slate-50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-body font-medium text-slate-900">
                        {problem.diagnosis}
                      </p>
                      {problem.icd10 && (
                        <p className="text-caption mt-1 text-slate-600">
                          ICD-10: {problem.icd10}
                        </p>
                      )}
                      {problem.onsetDate && (
                        <p className="text-caption mt-1 text-slate-600">
                          Since: {new Date(problem.onsetDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Badge
                      className={
                        problem.status === 'active'
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-500 text-white'
                      }
                    >
                      {problem.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-body text-slate-600">No active problems</p>
          )}
        </CardContent>
      </Card>

      {/* Medications */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-h3 flex items-center gap-2 text-slate-900">
            <Pill className="w-5 h-5 text-teal-600" />
            Medications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {medications.length > 0 ? (
            <div className="space-y-2">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className="p-3 rounded-2xl bg-slate-50"
                >
                  <p className="text-body font-medium text-slate-900">
                    {med.name}
                  </p>
                  <p className="text-caption mt-1 text-slate-600">
                    {med.dosage} • {med.frequency}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-body text-slate-600">No medications</p>
          )}
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-h3 flex items-center gap-2 text-slate-900">
            <AlertTriangle className="w-5 h-5 text-teal-600" />
            Allergies
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allergies.length > 0 ? (
            <div className="space-y-2">
              {allergies.map((allergy) => (
                <div
                  key={allergy.id}
                  className="p-3 rounded-2xl bg-slate-50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-body font-medium text-slate-900">
                        {allergy.allergen}
                      </p>
                      {allergy.reaction && (
                        <p className="text-caption mt-1 text-slate-600">
                          Reaction: {allergy.reaction}
                        </p>
                      )}
                    </div>
                    {allergy.severity && (
                      <Badge
                        className={
                          allergy.severity === 'severe' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                        }
                      >
                        {allergy.severity}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-body text-slate-600">No known allergies</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

