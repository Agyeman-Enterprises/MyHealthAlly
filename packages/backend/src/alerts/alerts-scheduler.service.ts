import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AlertsService } from './alerts.service';
import { PrismaService } from '../prisma/prisma.service';
import { RulesEngineService } from '../rules-engine/rules-engine.service';

@Injectable()
export class AlertsSchedulerService {
  private readonly logger = new Logger(AlertsSchedulerService.name);

  constructor(
    private alertsService: AlertsService,
    private prisma: PrismaService,
    private rulesEngine: RulesEngineService,
  ) {}

  @Cron('*/5 * * * *') // Every 5 minutes
  async handleAlertsCheck() {
    this.logger.log('Running alerts check with rules engine...');

    const patients = await this.prisma.patient.findMany();

    for (const patient of patients) {
      try {
        // Use rules engine for all evaluations
        await this.rulesEngine.evaluateRulesForPatient(patient.id);
      } catch (error) {
        this.logger.error(`Error checking alerts for patient ${patient.id}:`, error);
      }
    }

    this.logger.log('Alerts check completed');
  }
}

