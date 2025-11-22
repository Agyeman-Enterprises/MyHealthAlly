import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CarePlanPhase } from '@myhealthally/shared';

@Injectable()
export class CarePlansService {
  constructor(private prisma: PrismaService) {}

  async create(patientId: string, phases: CarePlanPhase[]) {
    return this.prisma.carePlan.create({
      data: {
        patientId,
        phases: phases as any,
      },
    });
  }

  async findByPatient(patientId: string) {
    return this.prisma.carePlan.findFirst({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(patientId: string, phases: CarePlanPhase[]) {
    const existing = await this.findByPatient(patientId);
    if (existing) {
      return this.prisma.carePlan.update({
        where: { id: existing.id },
        data: { phases: phases as any },
      });
    }
    return this.create(patientId, phases);
  }
}

