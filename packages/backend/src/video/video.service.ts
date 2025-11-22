import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class VideoService {
  private readonly dailyApiKey: string;
  private readonly dailyApiUrl = 'https://api.daily.co/v1';

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    // Get Daily.co Video API key from environment
    // Get from: https://dashboard.daily.co/developers → API Keys
    this.dailyApiKey = this.config.get<string>('DAILY_API_KEY') || 'placeholder-secret';
    
    if (this.dailyApiKey === 'placeholder-secret') {
      console.warn('⚠️  Daily.co API key not configured. Using placeholder. Video calls will not work.');
      console.warn('   Get your API key from: https://dashboard.daily.co/developers');
    }
  }

  async createRoom(patientId: string, providerId?: string): Promise<{
    roomUrl: string;
    token: string;
    roomName: string;
  }> {
    const roomName = `room-${patientId}-${Date.now()}`;
    
    // If API key is configured, use real Daily.co API
    if (this.dailyApiKey && this.dailyApiKey !== 'placeholder-secret') {
      try {
        const response = await fetch(`${this.dailyApiUrl}/rooms`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.dailyApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: roomName,
            privacy: 'private',
            properties: {
              exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Daily.co API error: ${response.statusText}`);
        }

        const roomData = await response.json();
        const token = this.generateDailyToken(roomName, patientId, providerId);

        return {
          roomUrl: roomData.url,
          token,
          roomName: roomData.name,
        };
      } catch (error) {
        console.error('Error creating Daily.co room:', error);
        throw error;
      }
    }

    // Fallback to placeholder if API key not configured
    const roomUrl = `https://myhealthally.daily.co/${roomName}`;
    const token = this.generateToken(roomName, patientId, providerId);

    return {
      roomUrl,
      token,
      roomName,
    };
  }

  private generateDailyToken(roomName: string, patientId: string, providerId?: string): string {
    // Generate Daily.co token using their API
    const payload = {
      room: roomName,
      user_id: patientId,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      is_owner: !providerId, // Patient is owner if no provider
    };

    // Daily.co uses JWT tokens signed with your API key
    return jwt.sign(payload, this.dailyApiKey, {
      algorithm: 'HS256',
    });
  }

  private generateToken(roomName: string, patientId: string, providerId?: string): string {
    // Placeholder token generation (when API key not configured)
    const payload = {
      room: roomName,
      user_id: patientId,
      exp: Math.floor(Date.now() / 1000) + 3600,
      is_owner: !providerId,
    };

    return jwt.sign(payload, this.dailyApiKey, {
      algorithm: 'HS256',
    });
  }

  async getRoomToken(roomName: string, userId: string, isOwner: boolean = false): Promise<string> {
    if (this.dailyApiKey && this.dailyApiKey !== 'placeholder-secret') {
      return this.generateDailyToken(roomName, userId);
    }
    return this.generateToken(roomName, userId);
  }
}

