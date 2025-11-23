import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LabOrdersService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    patientId: string;
    visitId?: string;
    providerId: string;
    tests: string[];
    notes?: string;
  }) {
    return (this.prisma as any).labOrder.create({
      data: {
        patientId: data.patientId,
        visitId: data.visitId,
        providerId: data.providerId,
        tests: data.tests,
        notes: data.notes,
        status: 'ORDERED',
      },
    });
  }

  async findByPatient(patientId: string) {
    return (this.prisma as any).labOrder.findMany({
      where: { patientId },
      orderBy: { orderedAt: 'desc' },
    });
  }

  async findByProvider(providerId: string) {
    return (this.prisma as any).labOrder.findMany({
      where: { providerId },
      orderBy: { orderedAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: string, results?: any) {
    const updateData: any = { status };
    if (status === 'COMPLETED' && results) {
      updateData.results = results;
      updateData.completedAt = new Date();
    }
    return (this.prisma as any).labOrder.update({
      where: { id },
      data: updateData,
    });
  }

  async findById(id: string) {
    const order = await (this.prisma as any).labOrder.findUnique({
      where: { id },
    });
    if (!order) {
      throw new NotFoundException(`Lab order ${id} not found`);
    }
    return order;
  }
}

