'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAPI } from '@/lib/utils';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react';

interface VideoCallProps {
  roomName: string;
  token: string;
  onEndCall: () => void;
}

export function VideoCall({ roomName, token, onEndCall }: VideoCallProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // TODO: Initialize Daily.co iframe or WebRTC
    // For now, this is a placeholder component
    console.log('Video call initialized:', { roomName, token });
  }, [roomName, token]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Video Call</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative bg-black rounded-lg aspect-video mb-4">
          {/* Remote video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded-lg"
          />
          
          {/* Local video (picture-in-picture) */}
          <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          
          <Button
            variant={isVideoOff ? "destructive" : "outline"}
            size="icon"
            onClick={() => setIsVideoOff(!isVideoOff)}
          >
            {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="destructive"
            size="icon"
            onClick={onEndCall}
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Room: {roomName}
        </div>
      </CardContent>
    </Card>
  );
}

