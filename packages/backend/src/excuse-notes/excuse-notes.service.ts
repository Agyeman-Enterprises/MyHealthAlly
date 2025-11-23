import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExcuseNotesService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    patientId: string;
    visitId?: string;
    providerId: string;
    type: string;
    startDate: Date;
    endDate: Date;
    reason: string;
    restrictions?: string;
  }) {
    return (this.prisma as any).excuseNote.create({
      data: {
        patientId: data.patientId,
        visitId: data.visitId,
        providerId: data.providerId,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
        restrictions: data.restrictions,
        status: 'DRAFT',
      },
    });
  }

  async send(id: string) {
    return (this.prisma as any).excuseNote.update({
      where: { id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });
  }

  async findByPatient(patientId: string) {
    return (this.prisma as any).excuseNote.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByProvider(providerId: string) {
    return (this.prisma as any).excuseNote.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const note = await (this.prisma as any).excuseNote.findUnique({
      where: { id },
    });
    if (!note) {
      throw new NotFoundException(`Excuse note ${id} not found`);
    }
    return note;
  }
}

