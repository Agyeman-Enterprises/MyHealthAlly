/**
 * Mic Diagnostics Panel
 * Shows live mic meter, error banners, and diagnostic information
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export interface MicDiagnosticsProps {
  stream: MediaStream | null;
  isRecording: boolean;
  error: string | null;
  onTestMic?: () => void;
}

export function MicDiagnostics({ stream, isRecording, error, onTestMic }: MicDiagnosticsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [permissions, setPermissions] = useState<{ microphone: PermissionState }>({
    microphone: 'prompt',
  });
  const [deviceInfo, setDeviceInfo] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Check permissions
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then((result) => {
        setPermissions({ microphone: result.state });
        result.onchange = () => {
          setPermissions({ microphone: result.state });
        };
      });
    }
  }, []);

  // Get audio devices
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const audioInputs = devices.filter((device) => device.kind === 'audioinput');
      setDeviceInfo(audioInputs);
    });
  }, []);

  // Setup audio level monitoring
  useEffect(() => {
    if (stream && isRecording) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);

        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const updateLevel = () => {
          if (!analyserRef.current) return;

          const dataArray = new Uint8Array(analyser.fftSize);
          analyser.getByteFrequencyData(dataArray);

          // Calculate average level
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          const normalizedLevel = Math.min(average / 255, 1);
          setAudioLevel(normalizedLevel);

          animationFrameRef.current = requestAnimationFrame(updateLevel);
        };

        updateLevel();
      } catch (err) {
        console.error('Failed to setup audio level monitoring:', err);
      }
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setAudioLevel(0);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [stream, isRecording]);

  const getPermissionStatus = () => {
    if (permissions.microphone === 'granted') return '✅ Granted';
    if (permissions.microphone === 'denied') return '❌ Denied';
    return '⚠️ Prompt';
  };

  const getAudioLevelColor = () => {
    if (audioLevel > 0.7) return 'bg-green-500';
    if (audioLevel > 0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      {/* Hard-stop Error Banner */}
      {error && (
        <Card variant="elevated" className="bg-red-50 border-2 border-red-500 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">Microphone Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Live Mic Meter */}
      {stream && isRecording && (
        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Audio Level</span>
            <span className="text-xs text-gray-500">{Math.round(audioLevel * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getAudioLevelColor()}`}
              style={{ width: `${audioLevel * 100}%` }}
            />
          </div>
        </Card>
      )}

      {/* Diagnostics Panel (Collapsible) */}
      <Card variant="elevated" className="p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="text-sm font-medium text-gray-700">Diagnostics</span>
          <svg
            className={`h-5 w-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-3">
            <div>
              <span className="text-xs text-gray-500">Microphone Permission:</span>
              <span className="ml-2 text-sm font-medium">{getPermissionStatus()}</span>
            </div>

            <div>
              <span className="text-xs text-gray-500">Stream Status:</span>
              <span className="ml-2 text-sm font-medium">
                {stream ? '✅ Active' : '❌ Inactive'}
              </span>
            </div>

            <div>
              <span className="text-xs text-gray-500">Recording Status:</span>
              <span className="ml-2 text-sm font-medium">
                {isRecording ? '🔴 Recording' : '⏸️ Stopped'}
              </span>
            </div>

            {deviceInfo.length > 0 && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Audio Input Device:</label>
                <select
                  value={selectedDevice || ''}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                >
                  {deviceInfo.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Device ${device.deviceId.substring(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {onTestMic && (
              <Button variant="outline" size="sm" onClick={onTestMic} className="w-full">
                Test Microphone
              </Button>
            )}

            <div className="text-xs text-gray-400 pt-2 border-t">
              <p>Browser: {navigator.userAgent}</p>
              <p>Audio Context: {audioContextRef.current ? '✅ Available' : '❌ Unavailable'}</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

