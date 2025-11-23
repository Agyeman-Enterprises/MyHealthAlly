import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(clinicId?: string) {
    return this.prisma.patient.findMany({
      where: clinicId ? { clinicId } : undefined,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        clinic: true,
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.patient.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async getVitalsSummary(patientId: string) {
    // Get latest readings from both Measurement and device-specific models
    const [latestVital, latestHRV, latestBMI, latestMeasurements] = await Promise.all([
      (this.prisma as any).vitalReading.findFirst({
        where: { patientId },
        orderBy: { timestamp: 'desc' },
      }),
      (this.prisma as any).hRVReading.findFirst({
        where: { patientId },
        orderBy: { timestamp: 'desc' },
      }),
      (this.prisma as any).bMIReading.findFirst({
        where: { patientId },
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.measurement.findMany({
        where: { patientId },
        orderBy: { timestamp: 'desc' },
        take: 20, // Get recent measurements
      }),
    ]);

    // Aggregate vitals from all sources
    const vitals: any = {};

    // From VitalReading
    if (latestVital) {
      if (latestVital.heartRate) vitals.heartRate = latestVital.heartRate;
      if (latestVital.spo2) vitals.spo2 = latestVital.spo2;
      if (latestVital.respiration) vitals.respiration = latestVital.respiration;
      if (latestVital.systolicBP) vitals.systolicBP = latestVital.systolicBP;
      if (latestVital.diastolicBP) vitals.diastolicBP = latestVital.diastolicBP;
    }

    // From HRVReading
    if (latestHRV) {
      vitals.hrv = latestHRV.rmssdMs;
    }

    // From BMIReading
    if (latestBMI) {
      vitals.bmi = latestBMI.bmi;
      vitals.weight = latestBMI.weightKg;
    }

    // From Measurements (flexible type system)
    for (const measurement of latestMeasurements) {
      const type = measurement.type.toLowerCase();
      if (typeof measurement.value === 'number') {
        if (type === 'weight' && !vitals.weight) vitals.weight = measurement.value;
        if (type === 'glucose') vitals.glucose = measurement.value;
        if (type === 'heart_rate' && !vitals.heartRate) vitals.heartRate = measurement.value;
        if (type === 'systolic_bp' && !vitals.systolicBP) vitals.systolicBP = measurement.value;
        if (type === 'diastolic_bp' && !vitals.diastolicBP) vitals.diastolicBP = measurement.value;
        if (type === 'hrv' && !vitals.hrv) vitals.hrv = measurement.value;
        if (type === 'spo2' && !vitals.spo2) vitals.spo2 = measurement.value;
        if (type === 'respiration' && !vitals.respiration) vitals.respiration = measurement.value;
      } else if (typeof measurement.value === 'object' && measurement.value !== null) {
        // Handle object values (e.g., blood pressure {systolic: 120, diastolic: 80})
        const value = measurement.value as any;
        if (type === 'blood_pressure') {
          if (value.systolic && !vitals.systolicBP) vitals.systolicBP = value.systolic;
          if (value.diastolic && !vitals.diastolicBP) vitals.diastolicBP = value.diastolic;
        }
      }
    }

    return vitals;
  }

  async recordVital(patientId: string, data: { type: string; value: number | string; timestamp?: string; source?: string }) {
    const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
    const source = data.source || 'MANUAL';

    // Convert value to appropriate format
    let value: any = data.value;
    if (typeof data.value === 'string' && !isNaN(Number(data.value))) {
      value = Number(data.value);
    }

    // Handle special cases (e.g., BMI calculation if weight/height provided)
    if (data.type === 'bmi' && typeof value === 'number') {
      // BMI is typically calculated, but we can store it if provided
      // In a real implementation, we might want to calculate it from weight/height
    }

    return this.prisma.measurement.create({
      data: {
        patientId,
        type: data.type,
        value,
        timestamp,
        source,
      },
    });
  }

  async getLabOrders(patientId: string) {
    return (this.prisma as any).labOrder.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        visit: {
          include: {
            provider: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getLabResults(patientId: string) {
    return (this.prisma as any).labOrder.findMany({
      where: {
        patientId,
        status: {
          in: ['COMPLETED', 'REVIEWED'],
        },
      },
      orderBy: { completedAt: 'desc' },
      include: {
        visit: {
          include: {
            provider: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getReferrals(patientId: string) {
    return (this.prisma as any).referral.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        visit: {
          include: {
            provider: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getDocuments(patientId: string) {
    // Get both excuse notes and referrals as documents
    const [excuseNotes, referrals] = await Promise.all([
      (this.prisma as any).excuseNote.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
        include: {
          visit: {
            include: {
              provider: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      (this.prisma as any).referral.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
        include: {
          visit: {
            include: {
              provider: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    // Combine and format as documents
    return {
      excuseNotes,
      referrals,
    };
  }
}
