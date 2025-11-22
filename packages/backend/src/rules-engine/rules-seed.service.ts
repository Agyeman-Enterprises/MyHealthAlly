import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { seedDefaultRules } from './rules-seed';

@Injectable()
export class RulesSeedService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Seed default rules on startup
    try {
      await seedDefaultRules();
    } catch (error) {
      console.error('Error seeding default rules:', error);
    }
  }
}

