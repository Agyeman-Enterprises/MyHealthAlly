'use client';
import { useState, useRef, useEffect } from 'react';
import { VoiceRecorder } from '@/components/voice/VoiceRecorder';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { transcribeAudio } from '@/lib/services/transcription';

interface Medication {
  id?: string;
  name: string;
  dosage: string;
  dosageUnit: string;
  frequency: string;
  route?: string;
  instructions?: string;
}

interface MedicationLoggerProps {
  medications: Medication[];
  onMedicationsChange: (medications: Medication[]) => void;
}

type InputMode = 'text' | 'voice' | 'camera';

export function MedicationLogger({ medications, onMedicationsChange }: MedicationLoggerProps) {
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<PermissionState | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // Text input state
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [dosageUnit, setDosageUnit] = useState('mg');
  const [frequency, setFrequency] = useState('');
  const [route, setRoute] = useState('oral');
  const [instructions, setInstructions] = useState('');
  
  // Camera refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check camera permission
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'camera' as PermissionName }).then((result) => {
        setCameraPermission(result.state);
        result.onchange = () => {
          setCameraPermission(result.state);
        };
      }).catch(() => {
        // Permissions API not fully supported
      });
    }
  }, []);

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [showCamera]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser.');
      }

      if (cameraPermission === 'denied') {
        throw new Error('Camera permission denied. Please enable in browser settings.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', // Back camera for better text reading
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setShowCamera(true);
    } catch (error: unknown) {
      console.error('Camera error:', error);
      let errorMessage = 'Camera access denied or not available.';
      
      if (error instanceof Error && (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError')) {
        errorMessage = 'Camera permission denied. Please allow camera access in browser settings.';
      } else if (error instanceof Error && error.name === 'NotFoundError') {
        errorMessage = 'No camera found. Please use text or voice input instead.';
      } else if (error instanceof Error && error.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application.';
      }
      
      setCameraError(errorMessage);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          setProcessing(true);
          try {
            // For now, we'll just save the image and prompt user to enter details manually
            // In production, you could use OCR API to extract medication info from the image
            alert('Photo captured! Please enter the medication details below. OCR extraction coming soon.');
            stopCamera();
            setInputMode('text');
          } catch (error) {
            console.error('Error processing photo:', error);
            alert('Error processing photo. Please try again or use text/voice input.');
          } finally {
            setProcessing(false);
          }
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const handleVoiceComplete = async (audioBlob: Blob, duration: number, transcript: string) => {
    setProcessing(true);
    setShowVoiceRecorder(false);
    
    try {
      // Transcribe the audio
      const transcription = await transcribeAudio(audioBlob);
      const fullText = transcription.text || transcript;
      
      // Parse medication information from transcript
      // This is a simple parser - in production, you might use NLP or structured prompts
      const parsed = parseMedicationFromText(fullText);
      
      // Add to medications list
      const newMedication: Medication = {
        name: parsed.name || 'Unknown Medication',
        dosage: parsed.dosage || '',
        dosageUnit: parsed.dosageUnit || 'mg',
        frequency: parsed.frequency || '',
        route: parsed.route || 'oral',
        instructions: parsed.instructions || fullText,
      };
      
      onMedicationsChange([...medications, newMedication]);
      
      // Reset form
      resetForm();
      setInputMode('text');
    } catch (error: unknown) {
      console.error('Error processing voice:', error);
      alert('Error processing voice recording. Please try again or use text input.');
    } finally {
      setProcessing(false);
    }
  };

  const parseMedicationFromText = (text: string): Partial<Medication> => {
    const lowerText = text.toLowerCase();
    const parsed: Partial<Medication> = {};
    
    // Try to extract medication name (usually first few words)
    const words = text.split(/\s+/);
    if (words.length > 0) {
      parsed.name = words.slice(0, 3).join(' '); // First 3 words as medication name
    }
    
    // Extract dosage (look for numbers followed by mg, ml, etc.)
    const dosageMatch = text.match(/(\d+(?:\.\d+)?)\s*(mg|ml|mcg|g|units?|tablets?|capsules?|pills?)/i);
    if (dosageMatch) {
      parsed.dosage = dosageMatch[1] ?? '';
      parsed.dosageUnit = dosageMatch[2]?.toLowerCase() ?? '';
    }
    
    // Extract frequency (BID, TID, QD, once daily, twice daily, etc.)
    if (lowerText.includes('twice daily') || lowerText.includes('bid') || lowerText.includes('two times')) {
      parsed.frequency = 'BID';
    } else if (lowerText.includes('three times') || lowerText.includes('tid') || lowerText.includes('thrice')) {
      parsed.frequency = 'TID';
    } else if (lowerText.includes('once daily') || lowerText.includes('qd') || lowerText.includes('daily')) {
      parsed.frequency = 'QD';
    } else if (lowerText.includes('as needed') || lowerText.includes('prn')) {
      parsed.frequency = 'PRN';
    } else {
      // Try to extract any frequency pattern
      const freqMatch = text.match(/(\d+)\s*(times?|x)\s*(daily|day|week)/i);
      if (freqMatch) {
        parsed.frequency = `${freqMatch[1]}x ${freqMatch[3]}`;
      }
    }
    
    // Extract route
    if (lowerText.includes('oral') || lowerText.includes('by mouth')) {
      parsed.route = 'oral';
    } else if (lowerText.includes('topical') || lowerText.includes('on skin')) {
      parsed.route = 'topical';
    } else if (lowerText.includes('injection') || lowerText.includes('inject')) {
      parsed.route = 'injection';
    }
    
    parsed.instructions = text;
    
    return parsed;
  };

  const handleAddMedication = () => {
    if (!medicationName.trim()) {
      alert('Please enter a medication name');
      return;
    }
    
    const newMedication: Medication = {
      name: medicationName.trim(),
      dosage: dosage.trim(),
      dosageUnit: dosageUnit,
      frequency: frequency.trim(),
      route: route,
      instructions: instructions.trim(),
    };
    
    onMedicationsChange([...medications, newMedication]);
    resetForm();
  };

  const resetForm = () => {
    setMedicationName('');
    setDosage('');
    setDosageUnit('mg');
    setFrequency('');
    setRoute('oral');
    setInstructions('');
  };

  const removeMedication = (index: number) => {
    const updated = medications.filter((_, i) => i !== index);
    onMedicationsChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-navy-600">Current Medications</h3>
        <div className="flex gap-2">
          <Button
            variant={inputMode === 'text' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setInputMode('text');
              setShowVoiceRecorder(false);
              stopCamera();
            }}
          >
            📝 Text
          </Button>
          <Button
            variant={inputMode === 'voice' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setInputMode('voice');
              setShowVoiceRecorder(true);
              stopCamera();
            }}
          >
            🎤 Voice
          </Button>
          <Button
            variant={inputMode === 'camera' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setInputMode('camera');
              setShowVoiceRecorder(false);
              startCamera();
            }}
            disabled={cameraPermission === 'denied'}
          >
            📷 Camera
          </Button>
        </div>
      </div>

      {/* Voice Recorder Modal */}
      {showVoiceRecorder && (
        <Card className="p-4 bg-primary-50 border-primary-200">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-navy-600 font-medium">
              Speak your medication details (e.g., &quot;Lisinopril 10 milligrams once daily&quot;)
            </p>
            <button
              onClick={() => {
                setShowVoiceRecorder(false);
                setInputMode('text');
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <VoiceRecorder
            onRecordingComplete={handleVoiceComplete}
            onCancel={() => {
              setShowVoiceRecorder(false);
              setInputMode('text');
            }}
            maxDuration={120}
          />
        </Card>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <Card className="p-4 bg-primary-50 border-primary-200">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-navy-600 font-medium">
              Take a photo of your medication bottle or label
            </p>
            <button
              onClick={stopCamera}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          {cameraError ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {cameraError}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-auto max-h-96"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={capturePhoto}
                  isLoading={processing}
                  className="flex-1"
                >
                  📸 Capture Photo
                </Button>
                <Button
                  variant="outline"
                  onClick={stopCamera}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Text Input Form */}
      {inputMode === 'text' && !showVoiceRecorder && !showCamera && (
        <Card className="p-4">
          <div className="space-y-3">
            <Input
              label="Medication Name *"
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              placeholder="e.g., Lisinopril"
              required
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                label="Dosage"
                type="number"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="10"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  value={dosageUnit}
                  onChange={(e) => setDosageUnit(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="mg">mg</option>
                  <option value="ml">ml</option>
                  <option value="mcg">mcg</option>
                  <option value="g">g</option>
                  <option value="units">units</option>
                  <option value="tablets">tablets</option>
                  <option value="capsules">capsules</option>
                </select>
              </div>
              <Input
                label="Frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="e.g., Once daily, BID"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                <select
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="oral">Oral</option>
                  <option value="topical">Topical</option>
                  <option value="injection">Injection</option>
                  <option value="inhalation">Inhalation</option>
                  <option value="nasal">Nasal</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <Input
              label="Instructions (optional)"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g., Take with food"
            />
            <Button
              variant="primary"
              onClick={handleAddMedication}
              className="w-full"
            >
              Add Medication
            </Button>
          </div>
        </Card>
      )}

      {/* Medications List */}
      {medications.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Added Medications:</h4>
          {medications.map((med, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-navy-600">{med.name}</p>
                  <p className="text-sm text-gray-600">
                    {med.dosage && `${med.dosage} ${med.dosageUnit}`}
                    {med.frequency && ` • ${med.frequency}`}
                    {med.route && ` • ${med.route}`}
                  </p>
                  {med.instructions && (
                    <p className="text-xs text-gray-500 mt-1">{med.instructions}</p>
                  )}
                </div>
                <button
                  onClick={() => removeMedication(index)}
                  className="ml-2 text-red-600 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {processing && (
        <div className="text-center py-4">
          <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-sm text-gray-600">Processing...</p>
        </div>
      )}
    </div>
  );
}
