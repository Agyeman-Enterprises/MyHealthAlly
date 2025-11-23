import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { VisitRequestsService } from '../visit-requests/visit-requests.service';

@Injectable()
export class SlotsSchedulerService {
  private readonly logger = new Logger(SlotsSchedulerService.name);

  constructor(private visitRequestsService: VisitRequestsService) {}

  /**
   * Release expired held slots every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async releaseExpiredSlots() {
    this.logger.log('Running scheduled task: Release expired held slots');
    try {
      const releasedCount = await this.visitRequestsService.releaseHeldSlots();
      if (releasedCount > 0) {
        this.logger.log(`Released ${releasedCount} expired held slots`);
      }
    } catch (error) {
      this.logger.error('Error releasing expired slots:', error);
    }
  }
}

