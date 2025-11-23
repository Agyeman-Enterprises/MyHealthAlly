import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { normalizeHRVToRmssdMs, computeBMI } from '../lib/hrv/normalize';

type DeviceProvider = 'APPLE' | 'OURA' | 'FITBIT' | 'GARMIN' | 'WITHINGS';
type HRVContext = 'SLEEP' | 'REST' | 'WORKOUT' | 'UNKNOWN';

@Injectable()
export class DeviceWebhooksService {
  constructor(private prisma: PrismaService) {}

  async processOuraWebhook(body: any) {
    const userId = body.user_id;
    const device = await (this.prisma as any).deviceConnection.findFirst({
      where: { provider: 'OURA', externalId: userId },
      include: { patient: true },
    });

    if (!device) return { ok: true };

    const patientId = device.patientId;
    const writes: Promise<any>[] = [];

    // Process HRV data
    if (body.hrv) {
      for (const item of body.hrv) {
        const norm = normalizeHRVToRmssdMs({
          provider: 'OURA',
          rmssdMs: item.rmssd_ms,
        });
        if (!norm) continue;

        writes.push(
          (this.prisma as any).hRVReading.upsert({
            where: {
              id: item.id ?? `${patientId}-${item.timestamp}`,
            },
            update: {},
            create: {
              id: item.id ?? `${patientId}-${item.timestamp}`,
              patientId,
              timestamp: new Date(item.timestamp),
              source: 'OURA',
              rmssdMs: norm.rmssdMs,
              sdnnMs: norm.sdnnMs,
              context: 'SLEEP',
            },
          }),
        );
      }
    }

    // Process vital readings
    if (body.heart_rate) {
      for (const item of body.heart_rate) {
        writes.push(
          (this.prisma as any).vitalReading.upsert({
            where: {
              id: item.id ?? `${patientId}-hr-${item.timestamp}`,
            },
            update: {},
            create: {
              id: item.id ?? `${patientId}-hr-${item.timestamp}`,
              patientId,
              timestamp: new Date(item.timestamp),
              source: 'OURA',
              heartRate: item.bpm,
              spo2: item.spo2,
              respiration: item.respiration,
            },
          }),
        );
      }
    }

    await Promise.all(writes);
    return { ok: true };
  }

  async processFitbitWebhook(body: any) {
    const userId = body.user_id;
    const device = await (this.prisma as any).deviceConnection.findFirst({
      where: { provider: 'FITBIT', externalId: userId },
      include: { patient: true },
    });

    if (!device) return { ok: true };

    const patientId = device.patientId;
    const writes: Promise<any>[] = [];

    if (body.hrv) {
      for (const item of body.hrv) {
        const norm = normalizeHRVToRmssdMs({
          provider: 'FITBIT',
          rmssdMs: item.rmssd_ms,
        });
        if (!norm) continue;

        writes.push(
          (this.prisma as any).hRVReading.upsert({
            where: {
              id: item.id ?? `${patientId}-${item.timestamp}`,
            },
            update: {},
            create: {
              id: item.id ?? `${patientId}-${item.timestamp}`,
              patientId,
              timestamp: new Date(item.timestamp),
              source: 'FITBIT',
              rmssdMs: norm.rmssdMs,
              sdnnMs: norm.sdnnMs,
              context: (item.context?.toUpperCase() as HRVContext) || 'UNKNOWN',
            },
          }),
        );
      }
    }

    if (body.vitals) {
      for (const item of body.vitals) {
        writes.push(
          (this.prisma as any).vitalReading.upsert({
            where: {
              id: item.id ?? `${patientId}-vital-${item.timestamp}`,
            },
            update: {},
            create: {
              id: item.id ?? `${patientId}-vital-${item.timestamp}`,
              patientId,
              timestamp: new Date(item.timestamp),
              source: 'FITBIT',
              heartRate: item.heart_rate,
              spo2: item.spo2,
              respiration: item.respiration,
            },
          }),
        );
      }
    }

    await Promise.all(writes);
    return { ok: true };
  }

  async processGarminWebhook(body: any) {
    const userId = body.user_id;
    const device = await (this.prisma as any).deviceConnection.findFirst({
      where: { provider: 'GARMIN', externalId: userId },
      include: { patient: true },
    });

    if (!device) return { ok: true };

    const patientId = device.patientId;
    const writes: Promise<any>[] = [];

    if (body.hrv) {
      for (const item of body.hrv) {
        const norm = normalizeHRVToRmssdMs({
          provider: 'GARMIN',
          rmssdMs: item.rmssd_ms,
        });
        if (!norm) continue;

        writes.push(
          (this.prisma as any).hRVReading.upsert({
            where: {
              id: item.id ?? `${patientId}-${item.timestamp}`,
            },
            update: {},
            create: {
              id: item.id ?? `${patientId}-${item.timestamp}`,
              patientId,
              timestamp: new Date(item.timestamp),
              source: 'GARMIN',
              rmssdMs: norm.rmssdMs,
              sdnnMs: norm.sdnnMs,
              context: (item.context?.toUpperCase() as HRVContext) || 'UNKNOWN',
            },
          }),
        );
      }
    }

    if (body.vitals) {
      for (const item of body.vitals) {
        writes.push(
          (this.prisma as any).vitalReading.upsert({
            where: {
              id: item.id ?? `${patientId}-vital-${item.timestamp}`,
            },
            update: {},
            create: {
              id: item.id ?? `${patientId}-vital-${item.timestamp}`,
              patientId,
              timestamp: new Date(item.timestamp),
              source: 'GARMIN',
              heartRate: item.heart_rate,
              spo2: item.spo2,
              respiration: item.respiration,
            },
          }),
        );
      }
    }

    await Promise.all(writes);
    return { ok: true };
  }

  async processWithingsWebhook(body: any) {
    const externalUserId = body.external_user_id;
    const device = await (this.prisma as any).deviceConnection.findFirst({
      where: { provider: 'WITHINGS', externalId: externalUserId },
      include: { patient: true },
    });

    if (!device) return { ok: true };

    const { weight_kg, height_cm } = body;
    const patient = device.patient;
    const finalHeightCm = height_cm ?? patient.heightCm ?? 0;

    if (!finalHeightCm) return { ok: true };

    const bmi = computeBMI(weight_kg, finalHeightCm);
    if (!bmi) return { ok: true };

    await (this.prisma as any).bMIReading.create({
      data: {
        patientId: device.patientId,
        weightKg: weight_kg,
        heightCm: finalHeightCm,
        bmi,
      },
    });

    // Update patient height if provided
    if (height_cm && !patient.heightCm) {
      await this.prisma.patient.update({
        where: { id: device.patientId },
        data: { heightCm: height_cm } as any,
      });
    }

    return { ok: true };
  }
}

