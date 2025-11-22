import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MeasurementType } from '@myhealthally/shared';

@Injectable()
export class MeasurementsService {
  constructor(private prisma: PrismaService) {}

  async create(patientId: string, data: {
    type: MeasurementType;
    value: number | Record<string, any>;
    timestamp: Date;
    source: string;
    metadata?: Record<string, any>;
  }) {
    return this.prisma.measurement.create({
      data: {
        patientId,
        ...data,
      },
    });
  }

  async findByPatient(patientId: string, type?: MeasurementType, limit?: number) {
    return this.prisma.measurement.findMany({
      where: {
        patientId,
        ...(type && { type }),
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });
  }

  async getRecentByType(patientId: string, type: MeasurementType, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.measurement.findMany({
      where: {
        patientId,
        type,
        timestamp: {
          gte: startDate,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });
  }
}

