import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { computeRecoveryScore, computeStressLevel } from '../lib/hrv/metrics';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private prisma: PrismaService) {}

  @Get('analytics')
  async getAnalytics(@Request() req: any) {
    // Get patient ID from auth context
    const user = req.user;
    const patient = await this.prisma.patient.findFirst({
      where: { userId: user.id },
    });

    if (!patient) {
      return {
        recoveryScore: 0,
        stressLevel: 'moderate',
        latestVitals: null,
        hrvTrend: [],
        bmi: null,
      };
    }

    const patientId = patient.id;

    const [hrv, vitals, bmi] = await Promise.all([
      (this.prisma as any).hRVReading.findMany({
        where: { patientId },
        orderBy: { timestamp: 'asc' },
        take: 90,
      }),
      (this.prisma as any).vitalReading.findMany({
        where: { patientId },
        orderBy: { timestamp: 'asc' },
        take: 90,
      }),
      (this.prisma as any).bMIReading.findMany({
        where: { patientId },
        orderBy: { timestamp: 'desc' },
        take: 1,
      }),
    ]);

    const recoveryScore = computeRecoveryScore({ hrv, vitals });
    const stressLevel = computeStressLevel({ hrv, vitals });
    const latestVitals = vitals[vitals.length - 1];

    return {
      recoveryScore,
      stressLevel,
      latestVitals: latestVitals
        ? {
            heartRate: latestVitals.heartRate,
            spo2: latestVitals.spo2,
            respiration: latestVitals.respiration,
            systolicBP: latestVitals.systolicBP,
            diastolicBP: latestVitals.diastolicBP,
          }
        : null,
      hrvTrend: hrv.map((r) => ({
        timestamp: r.timestamp,
        rmssdMs: r.rmssdMs,
      })),
      bmi: bmi[0] ?? null,
    };
  }
}

