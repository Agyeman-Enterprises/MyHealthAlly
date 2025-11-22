import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VisitRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(patientId: string, data: {
    type: 'MA_CHECK' | 'PROVIDER';
    notes?: string;
  }) {
    return this.prisma.visitRequest.create({
      data: {
        patientId,
        ...data,
      },
    });
  }

  async findByPatient(patientId: string) {
    return this.prisma.visitRequest.findMany({
      where: { patientId },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async findAll(status?: string) {
    return this.prisma.visitRequest.findMany({
      where: status ? { status } : undefined,
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
      orderBy: { requestedAt: 'desc' },
    });
  }
}

