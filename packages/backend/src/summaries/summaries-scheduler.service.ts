import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SummariesService } from './summaries.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SummariesSchedulerService {
  private readonly logger = new Logger(SummariesSchedulerService.name);

  constructor(
    private summariesService: SummariesService,
    private prisma: PrismaService,
  ) {}

  @Cron('0 9 * * 1') // Every Monday at 9 AM
  async generateWeeklySummaries() {
    this.logger.log('Generating weekly summaries...');

    const patients = await this.prisma.patient.findMany();

    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - 1); // Yesterday (Sunday)
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6); // 7 days ago (Monday)

    for (const patient of patients) {
      try {
        const summary = await this.summariesService.generateWeeklySummary(
          patient.id,
          weekStart,
          weekEnd,
        );

        await this.summariesService.saveSummary(patient.id, weekStart, weekEnd, summary);
        await this.summariesService.createSummaryAlert(patient.id, summary);

        this.logger.log(`Generated summary for patient ${patient.id}`);
      } catch (error) {
        this.logger.error(`Error generating summary for patient ${patient.id}:`, error);
      }
    }

    this.logger.log('Weekly summaries generation completed');
  }
}

