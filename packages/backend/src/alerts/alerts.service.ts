import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AlertSeverity, AlertType } from '@myhealthally/shared';

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  async create(
    patientId: string,
    data: {
      severity: AlertSeverity;
      type: AlertType;
      title: string;
      body: string;
      payload?: Record<string, any>;
    },
  ) {
    return this.prisma.alert.create({
      data: {
        patientId,
        ...data,
      },
    });
  }

  async findByPatient(patientId: string, status?: string) {
    return this.prisma.alert.findMany({
      where: {
        patientId,
        ...(status && { status }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findActive() {
    return this.prisma.alert.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async resolve(id: string, note?: string) {
    return this.prisma.alert.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        ...(note && { payload: { resolutionNote: note } }),
      },
    });
  }

  async update(id: string, data: { status?: string; note?: string }) {
    const updateData: any = {};
    if (data.status) {
      updateData.status = data.status;
      if (data.status === 'RESOLVED') {
        updateData.resolvedAt = new Date();
      }
    }
    if (data.note) {
      const alert = await this.prisma.alert.findUnique({ where: { id } });
      const payload = (alert?.payload as any) || {};
      updateData.payload = { ...payload, note: data.note };
    }
    return this.prisma.alert.update({
      where: { id },
      data: updateData,
    });
  }

  async dismiss(id: string) {
    return this.prisma.alert.update({
      where: { id },
      data: {
        status: 'DISMISSED',
      },
    });
  }

  async checkBpHighTrend(patientId: string) {
    // Check last 3 BP readings
    const recentBp = await this.prisma.measurement.findMany({
      where: {
        patientId,
        type: 'BLOOD_PRESSURE',
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 3,
    });

    if (recentBp.length < 3) return false;

    // Check if all 3 are above threshold (e.g., systolic > 130 or diastolic > 80)
    const threshold = { systolic: 130, diastolic: 80 };
    const allHigh = recentBp.every((m) => {
      const value = m.value as any;
      if (typeof value === 'object' && value.systolic && value.diastolic) {
        return (
          value.systolic > threshold.systolic ||
          value.diastolic > threshold.diastolic
        );
      }
      return false;
    });

    if (allHigh) {
      // Check if alert already exists
      const existing = await this.prisma.alert.findFirst({
        where: {
          patientId,
          type: 'BP_HIGH_TREND',
          status: 'ACTIVE',
        },
      });

      if (!existing) {
        await this.create(patientId, {
          severity: AlertSeverity.WARNING,
          type: AlertType.BP_HIGH_TREND,
          title: 'Your blood pressure has been high',
          body: "Your readings have been above your target for 2 days. It's a good idea to check in.",
          payload: { readings: recentBp.map((m) => m.value) },
        });
      }
    }

    return allHigh;
  }

  async checkGlucoseHigh(patientId: string) {
    const recentGlucose = await this.prisma.measurement.findMany({
      where: {
        patientId,
        type: 'GLUCOSE',
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 5,
    });

    if (recentGlucose.length < 3) return false;

    const threshold = 140; // mg/dL
    const highReadings = recentGlucose.filter((m) => {
      const value =
        typeof m.value === 'number' ? m.value : (m.value as any).value;
      return value > threshold;
    });

    if (highReadings.length >= 3) {
      const existing = await this.prisma.alert.findFirst({
        where: {
          patientId,
          type: 'GLUCOSE_HIGH',
          status: 'ACTIVE',
        },
      });

      if (!existing) {
        await this.create(patientId, {
          severity: AlertSeverity.WARNING,
          type: AlertType.GLUCOSE_HIGH,
          title: 'Your sugars are above target',
          body: "Your glucose readings have been above your target even though you're taking your medication. This may mean your plan needs adjustment.",
          payload: { readings: highReadings.map((m) => m.value) },
        });
      }
    }
  }

  async checkNoData(patientId: string) {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const recentMeasurements = await this.prisma.measurement.findFirst({
      where: {
        patientId,
        timestamp: {
          gte: threeDaysAgo,
        },
      },
    });

    if (!recentMeasurements) {
      const existing = await this.prisma.alert.findFirst({
        where: {
          patientId,
          type: 'NO_DATA',
          status: 'ACTIVE',
        },
      });

      if (!existing) {
        await this.create(patientId, {
          severity: AlertSeverity.INFO,
          type: AlertType.NO_DATA,
          title: 'No data received',
          body: "We haven't received any health data from you in the last 3 days. Please sync your devices or enter data manually.",
        });
      }
    }
  }
}
