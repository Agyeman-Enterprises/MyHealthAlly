import { Module } from '@nestjs/common';
import { CarePlansController } from './care-plans.controller';
import { CarePlansService } from './care-plans.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CarePlansController],
  providers: [CarePlansService],
  exports: [CarePlansService],
})
export class CarePlansModule {}

