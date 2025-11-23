import { Module, forwardRef } from '@nestjs/common';
import { VisitRequestsController } from './visit-requests.controller';
import { VisitRequestsService } from './visit-requests.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SlotsModule } from '../slots/slots.module';
import { VisitsModule } from '../visits/visits.module';

@Module({
  imports: [PrismaModule, forwardRef(() => SlotsModule), forwardRef(() => VisitsModule)],
  controllers: [VisitRequestsController],
  providers: [VisitRequestsService],
  exports: [VisitRequestsService],
})
export class VisitRequestsModule {}
