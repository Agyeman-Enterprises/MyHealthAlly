import { Module, forwardRef } from '@nestjs/common';
import { SlotsController } from './slots.controller';
import { SlotService } from './slots.service';
import { SlotsSchedulerService } from './slots-scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';
import { VisitRequestsModule } from '../visit-requests/visit-requests.module';

@Module({
  imports: [PrismaModule, forwardRef(() => VisitRequestsModule)],
  controllers: [SlotsController],
  providers: [SlotService, SlotsSchedulerService],
  exports: [SlotService],
})
export class SlotsModule {}

