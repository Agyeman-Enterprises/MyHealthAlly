import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReferralsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    patientId: string;
    visitId?: string;
    providerId: string;
    specialty: string;
    reason: string;
    priority?: string;
    referredTo?: string;
    notes?: string;
  }) {
    return (this.prisma as any).referral.create({
      data: {
        patientId: data.patientId,
        visitId: data.visitId,
        providerId: data.providerId,
        specialty: data.specialty,
        reason: data.reason,
        priority: data.priority || 'ROUTINE',
        referredTo: data.referredTo,
        notes: data.notes,
        status: 'PENDING',
      },
    });
  }

  async send(id: string) {
    return (this.prisma as any).referral.update({
      where: { id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });
  }

  async findByPatient(patientId: string) {
    return (this.prisma as any).referral.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByProvider(providerId: string) {
    return (this.prisma as any).referral.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: string) {
    const updateData: any = { status };
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }
    return (this.prisma as any).referral.update({
      where: { id },
      data: updateData,
    });
  }

  async findById(id: string) {
    const referral = await (this.prisma as any).referral.findUnique({
      where: { id },
    });
    if (!referral) {
      throw new NotFoundException(`Referral ${id} not found`);
    }
    return referral;
  }
}

