import { Module } from '@nestjs/common';
import { SummariesService } from './summaries.service';
import { SummariesController } from './summaries.controller';
import { SummariesSchedulerService } from './summaries-scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [PrismaModule, AlertsModule],
  controllers: [SummariesController],
  providers: [SummariesService, SummariesSchedulerService],
  exports: [SummariesService],
})
export class SummariesModule {}

