import { Module } from '@nestjs/common';
import { VirtualVisitsController } from './virtual-visits.controller';
import { VirtualVisitService } from './virtual-visits.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VirtualVisitsController],
  providers: [VirtualVisitService],
  exports: [VirtualVisitService],
})
export class VirtualVisitsModule {}

