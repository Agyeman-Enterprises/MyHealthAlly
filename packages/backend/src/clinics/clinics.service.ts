import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClinicsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; brandingConfig?: any }) {
    return this.prisma.clinic.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.clinic.findMany();
  }

  async findOne(id: string) {
    return this.prisma.clinic.findUnique({
      where: { id },
    });
  }
}
