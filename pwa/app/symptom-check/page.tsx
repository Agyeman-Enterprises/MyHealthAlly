'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store/auth-store';
import { createSymptomCheckWithTask } from '@/lib/supabase/queries-symptom-check';
import type { TriageLevel } from '@/lib/supabase/queries-symptom-check';
import { translateText } from '@/lib/utils/translate';

type Step = 'disclaimer' | 'chief' | 'redflags' | 'intake' | 'review' | 'sent';

type QA = { key: string; question: string; answer: string };

const redFlagOptions = [
  'Chest pain or pressure',
  'Severe trouble breathing',
  'Fainting or unresponsiveness',
  'New weakness or numbness on one side',
  'Severe allergic reaction (swelling lips/tongue)',
  'Uncontrolled bleeding',
  'Severe abdominal pain with rigid belly',
  'Suicidal thoughts or self-harm urges',
];

const categories = [
  'Pain',
  'Fever',
  'GI',
  'Respiratory',
  'Skin',
  'Urinary',
  'Mental Health',
  'Other',
];

function sanitizePatientFacing(text: string): string {
  const forbidden = [
    /\b(you (have|likely have|probably have|definitely have)|this is|it is)\b.*\b(infection|pneumonia|appendicitis|flu|covid|stroke|heart attack|uti|migraine|cancer)\b/gi,
    /\b(diagnos(e|is)|diagnostic|pathognomonic)\b/gi,
    /\b(I think you have|sounds like you have|consistent with)\b/gi,
    /\b(you should|you need to|you must|I recommend)\b(?!.*\b(call (911|emergency)|go to (the )?(ER|emergency))\b)/gi,
    /\b(start|stop|increase|decrease|take)\b.*\b(mg|milligram|tablet|capsule|dose|dosing)\b/gi,
    /\b(antibiotic|steroid|opioid|benzodiazepine|insulin|warfarin)\b/gi,
    /\b\d{1,4}\s?(mg|mcg|g|ml)\b/gi,
    /\b(once|twice|three times)\s+(daily|a day)\b/gi,
    /\b(every)\s+\d+\s+(hours|hrs)\b/gi,
    /\b(\d{1,3}%|percent|chance|odds|probability)\b/gi,
    /\b(most likely|unlikely|highly likely)\b/gi,
    /\b(as your doctor|I am diagnosing|medical diagnosis)\b/gi,
  ];
  let cleaned = text;
  forbidden.forEach((re) => {
    cleaned = cleaned.replace(re, 'I can’t diagnose or give treatment advice. I can help organize your symptoms and send them to your care team.');
  });
  return cleaned;
}

function buildQuestions(category: string | null): { key: string; prompt: string }[] {
  const base = [
    { key: 'onset', prompt: 'When did this start?' },
    { key: 'course', prompt: 'Is it getting better, worse, or the same?' },
    { key: 'severity', prompt: 'How severe is it (0-10)?' },
    { key: 'associated', prompt: 'Any other symptoms you noticed?' },
    { key: 'context', prompt: 'Any recent changes—new meds, travel, sick contacts, diet change, injury?' },
  ];
  const extra: Record<string, { key: string; prompt: string }[]> = {
    Fever: [
      { key: 'fever_max', prompt: 'What was the highest temperature and how was it measured?' },
    ],
    Pain: [
      { key: 'pain_location', prompt: 'Where is the pain located?' },
      { key: 'pain_character', prompt: 'What does it feel like (sharp, dull, burning)?' },
    ],
    GI: [
      { key: 'gi_symptoms', prompt: 'Any vomiting or diarrhea? Any blood?' },
      { key: 'hydration', prompt: 'Are you keeping fluids down / any signs of dehydration?' },
    ],
    Respiratory: [
      { key: 'resp_symptoms', prompt: 'Any cough, wheeze, or known oxygen level?' },
    ],
    Urinary: [
      { key: 'urinary_symptoms', prompt: 'Any burning, frequency, or flank pain?' },
    ],
    Skin: [
      { key: 'skin_symptoms', prompt: 'Where is the rash? Is it itchy or painful?' },
    ],
    'Mental Health': [
      { key: 'mh_symptoms', prompt: 'How are sleep and anxiety/panic symptoms?' },
    ],
  };
  const extras = category && extra[category] ? extra[category] : [];
  return [...base, ...extras].slice(0, 8);
}

function generateSummaryPatient(chief: string, answers: QA[], redFlags: string[], triage: TriageLevel) {
  const lines = [
    `Chief concern: ${chief}`,
    `Triage: ${triage === 'emergent' ? 'urgent review recommended' : triage === 'urgent' ? 'needs prompt review' : 'routine review'}.`,
  ];
  answers.forEach((a) => lines.push(`${a.question} ${a.answer}`));
  if (redFlags.length) lines.push(`You flagged: ${redFlags.join(', ')}`);
  lines.push('This is not a diagnosis or medical advice. Your care team will review.');
  return sanitizePatientFacing(lines.join(' '));
}

function generateSummaryClinician(chief: string, answers: QA[], redFlags: string[], triage: TriageLevel) {
  const lines = [
    `Chief: ${chief}`,
    `Triage (non-binding): ${triage}`,
    `Red flags: ${redFlags.length ? redFlags.join(', ') : 'none'}`,
  ];
  answers.forEach((a) => lines.push(`${a.key}: ${a.answer}`));
  lines.push('Non-diagnostic considerations only; clinician to determine plan.');
  return lines.join('\n');
}

function generateEducation(triage: TriageLevel) {
  const base = [
    'Keep track of symptom changes and any new issues.',
    'Have your medication list handy when your care team follows up.',
    'Note any recent travel, new foods, or exposures that could be relevant.',
  ];
  if (triage !== 'routine') {
    base.push('If symptoms worsen or you feel unsafe, seek urgent or emergency care.');
  }
  return base;
}

export default function SymptomCheckPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [step, setStep] = useState<Step>('disclaimer');
  const [chiefConcern, setChiefConcern] = useState('');
  const [isDictatingChief, setIsDictatingChief] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [disclaimerAckAt, setDisclaimerAckAt] = useState<string | null>(null);
  const [redFlags, setRedFlags] = useState<string[]>([]);
  const [answers, setAnswers] = useState<QA[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isDictatingAnswer, setIsDictatingAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const questions = useMemo(() => buildQuestions(category), [category]);

  const triageLevel: TriageLevel = redFlags.length
    ? 'emergent'
    : (answers.find((a) => a.key === 'severity')?.answer || '').match(/\b(8|9|10)\b/)
    ? 'urgent'
    : 'routine';

  const handleDisclaimerContinue = async () => {
    setDisclaimerAckAt(new Date().toISOString());
    setStep('chief');
  };

  const startDictation = (target: 'chief' | 'answer') => {
    // Minimal Web Speech API dictation for quick voice logging
    const SpeechRecognitionCtor =
      typeof window !== 'undefined' &&
      ((window as typeof window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
        (window as typeof window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).webkitSpeechRecognition);

    if (!SpeechRecognitionCtor) {
      setError('Voice input not supported in this browser.');
      return;
    }

    try {
      const recognition = new (SpeechRecognitionCtor as {
        new (): {
          lang: string;
          interimResults: boolean;
          continuous: boolean;
          start: () => void;
          stop: () => void;
          onresult: ((event: unknown) => void) | null;
          onerror: ((event: { error?: string }) => void) | null;
          onend: (() => void) | null;
        };
      })();
      const browserLang = typeof navigator !== 'undefined' && typeof navigator.language === 'string' ? navigator.language : 'en-US';
      recognition.lang = browserLang;
      recognition.interimResults = false;
      recognition.continuous = true;

      if (target === 'chief') setIsDictatingChief(true);
      if (target === 'answer') setIsDictatingAnswer(true);

      let sessionTranscript = '';
      recognition.onresult = (event) => {
        const evt = event as { resultIndex: number; results: Array<unknown> };
        for (let i = evt.resultIndex; i < evt.results.length; i++) {
          const res = evt.results[i] as unknown as { [key: number]: { transcript: string }; isFinal?: boolean };
          const first = res?.[0];
          if (!first?.transcript) continue;
          sessionTranscript += `${first.transcript} `;
        }
      };

      recognition.onerror = (e) => {
        setError(`Voice input error: ${(e as { error?: string }).error || 'unknown'}`);
      };

      recognition.onend = () => {
        if (target === 'chief') setIsDictatingChief(false);
        if (target === 'answer') setIsDictatingAnswer(false);
        const finalTranscript = sessionTranscript.trim();
        if (!finalTranscript) return;
        if (target === 'chief') {
          setChiefConcern((prev) => (prev ? `${prev} ${finalTranscript}`.trim() : finalTranscript));
        } else {
          setCurrentAnswer((prev) => (prev ? `${prev} ${finalTranscript}`.trim() : finalTranscript));
        }
      };

      recognition.start();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start voice input.');
      setIsDictatingChief(false);
      setIsDictatingAnswer(false);
    }
  };

  const toggleRedFlag = (rf: string) => {
    setRedFlags((prev) => (prev.includes(rf) ? prev.filter((r) => r !== rf) : [...prev, rf]));
  };

  const handleAnswer = () => {
    if (!questions[currentQuestionIdx]) {
      setStep('review');
      return;
    }
    if (!currentAnswer.trim()) return;
    if (answers.length >= 12) return;
    const q = questions[currentQuestionIdx];
    const newAnswers = [...answers, { key: q.key, question: q.prompt, answer: currentAnswer.trim() }];
    setAnswers(newAnswers);
    setCurrentAnswer('');
    if (currentQuestionIdx + 1 < questions.length && newAnswers.length < 12) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      setStep('review');
    }
  };

  const handleEditAnswers = () => {
    setStep('intake');
  };

  const sendToCareTeam = async () => {
    if (!chiefConcern.trim() || !patientId) {
      setError('Patient ID or chief concern missing.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const summaryPatient = generateSummaryPatient(chiefConcern.trim(), answers, redFlags, triageLevel);
      // Translate patient narrative to English for care team; keep source language noted
      const combined = [chiefConcern, ...answers.map((a) => a.answer)].join('\n');
      const { translatedText } = await translateText(combined, 'en');
      const translatedChief = translatedText || chiefConcern.trim();
      const translatedAnswers = answers.map((a) => ({ ...a, answer: a.answer }));
      const summaryClinician = generateSummaryClinician(translatedChief, translatedAnswers, redFlags, triageLevel);
      const education = generateEducation(triageLevel);
      await createSymptomCheckWithTask({
        patientId,
        disclaimerAckAt,
        chiefComplaintText: chiefConcern.trim(),
        category,
        redFlagsSelected: redFlags,
        triageLevel,
        answers,
        summaryPatientSafe: summaryPatient,
        summaryClinician,
        education,
      });
      setSuccess('Sent to your care team. A clinician will review.');
      setStep('sent');
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Unable to send.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientId = async () => {
    const store = useAuthStore.getState();
    let pid = store.patientId || store.user?.patientId;
    if (!pid) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('patients(id)')
          .eq('supabase_auth_id', user.id)
          .single();
        const arr = Array.isArray(data?.patients) ? data?.patients : data?.patients ? [data?.patients] : [];
        pid = arr[0]?.id;
      }
    }
    setPatientId(pid || null);
  };

  useEffect(() => { void loadPatientId(); }, []);

  const disclaimerBlock = (
    <Card className="mb-4">
      <h2 className="text-lg font-semibold text-navy-600">AI-Assisted Symptom Check</h2>
      <p className="text-sm text-gray-700 mt-2">
        This tool helps organize your symptoms and share them with your care team. It does not provide a diagnosis or medical advice.
        If you think you may be having an emergency, call your local emergency number or go to the nearest emergency department.
      </p>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 pb-20 md:pb-8">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-navy-600 mb-2">Symptom Check (AI-assisted)</h1>
        {disclaimerBlock}
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        {success && <p className="text-sm text-green-600 mb-3">{success}</p>}

        {step === 'disclaimer' && (
          <Card>
            <p className="text-sm text-gray-700 mb-3">
              By continuing, you understand:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-4">
              <li>This is not a diagnosis or medical advice.</li>
              <li>Your information will be shared with your care team for review.</li>
              <li>For emergencies, call your local emergency number or go to the nearest emergency department.</li>
            </ul>
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleDisclaimerContinue}>Continue</Button>
              <Button variant="outline" onClick={() => { setRedFlags(['Emergency intent']); setStep('redflags'); }}>I’m having an emergency</Button>
            </div>
          </Card>
        )}

        {step === 'chief' && (
          <Card className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What’s going on today?</label>
              <textarea
                value={chiefConcern}
                onChange={(e) => setChiefConcern(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-400"
                placeholder="Briefly describe your concern (1–3 sentences)"
              />
              <div className="flex items-center gap-2 mt-2">
                <Button variant="secondary" onClick={() => startDictation('chief')} disabled={isDictatingChief}>
                  {isDictatingChief ? 'Listening…' : 'Voice log'}
                </Button>
                <p className="text-xs text-gray-500">Speak to fill this field; we’ll transcribe it.</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Pick a category (optional)</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(category === cat ? null : cat)}
                    className={`px-3 py-2 rounded-full border ${category === cat ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-700'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" onClick={() => setStep('redflags')} disabled={!chiefConcern.trim()}>Next</Button>
            </div>
          </Card>
        )}

        {step === 'redflags' && (
          <Card className="space-y-3">
            <p className="text-sm text-gray-700">Any of these right now?</p>
            <div className="space-y-2">
              {redFlagOptions.map((rf) => (
                <label key={rf} className="flex items-center gap-3">
                  <input type="checkbox" checked={redFlags.includes(rf)} onChange={() => toggleRedFlag(rf)} />
                  <span className="text-sm text-gray-800">{rf}</span>
                </label>
              ))}
            </div>
            {redFlags.length > 0 && (
              <Card className="bg-red-50 border-red-200">
                <p className="text-sm text-red-700 font-semibold">This may be urgent. Call local emergency number or go to nearest ER now. If safe, have someone stay with you.</p>
              </Card>
            )}
            <div className="flex gap-2">
              <Button variant="primary" onClick={() => setStep('intake')}>Continue</Button>
              {redFlags.length > 0 && (
                <Button variant="outline" onClick={() => setStep('review')}>
                  Send to care team now
                </Button>
              )}
            </div>
          </Card>
        )}

        {step === 'intake' && (
          <Card className="space-y-4">
            {questions[currentQuestionIdx] ? (
              <>
                <p className="text-sm text-gray-700">Question {currentQuestionIdx + 1} of {questions.length} (max 12 total)</p>
                <p className="font-medium text-navy-600">{questions[currentQuestionIdx]?.prompt}</p>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-400"
                  placeholder="Type your answer"
                />
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={() => startDictation('answer')} disabled={isDictatingAnswer}>
                    {isDictatingAnswer ? 'Listening…' : 'Voice log'}
                  </Button>
                  <p className="text-xs text-gray-500">Use voice to log this answer.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" onClick={handleAnswer} disabled={!currentAnswer.trim()}>Save answer</Button>
                  <Button variant="outline" onClick={() => setStep('review')}>Skip to review</Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-700">No more questions. Review and send.</p>
            )}
            <div className="space-y-1">
              {answers.map((a) => (
                <div key={a.key} className="text-sm text-gray-700">
                  <strong>{a.question}</strong> {a.answer}
                </div>
              ))}
            </div>
          </Card>
        )}

        {step === 'review' && (
          <Card className="space-y-3">
            <h2 className="text-lg font-semibold text-navy-600">Review</h2>
            <p className="text-sm text-gray-700">Chief concern: {chiefConcern}</p>
            <p className="text-sm text-gray-700">Category: {category || 'Not set'}</p>
            <p className="text-sm text-gray-700">Red flags: {redFlags.length ? redFlags.join(', ') : 'None'}</p>
            <div className="space-y-1">
              {answers.map((a) => (
                <div key={a.key} className="text-sm text-gray-800">
                  <strong>{a.question}</strong> {a.answer}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEditAnswers}>Edit my answers</Button>
              <Button variant="primary" onClick={sendToCareTeam} isLoading={loading} disabled={loading || !patientId}>Send to care team</Button>
            </div>
            <p className="text-xs text-gray-600">Not a diagnosis or medical advice. Your care team will review.</p>
          </Card>
        )}

        {step === 'sent' && (
          <Card className="space-y-3">
            <h2 className="text-lg font-semibold text-navy-600">Sent to your care team</h2>
            <p className="text-sm text-gray-700">A clinician will review your information and respond. If symptoms worsen or you feel unsafe, seek urgent or emergency care.</p>
            <div className="space-y-1">
              {generateEducation(triageLevel).map((tip, idx) => (
                <p key={idx} className="text-sm text-gray-700">• {tip}</p>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="primary" onClick={() => router.push('/messages')}>Message care team</Button>
              <Button variant="outline" onClick={() => router.push('/appointments')}>Book appointment</Button>
            </div>
          </Card>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
