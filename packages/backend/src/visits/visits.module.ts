import { Module, forwardRef } from '@nestjs/common';
import { VisitsController } from './visits.controller';
import { VisitService } from './visits.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SlotsModule } from '../slots/slots.module';

@Module({
  imports: [PrismaModule, forwardRef(() => SlotsModule)],
  controllers: [VisitsController],
  providers: [VisitService],
  exports: [VisitService],
})
export class VisitsModule {}

