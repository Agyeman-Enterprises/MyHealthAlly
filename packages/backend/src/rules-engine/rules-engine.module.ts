import { Module } from '@nestjs/common';
import { RulesEngineService } from './rules-engine.service';
import { RulesEngineController } from './rules-engine.controller';
import { RulesSeedService } from './rules-seed.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AlertsModule } from '../alerts/alerts.module';
import { VisitRequestsModule } from '../visit-requests/visit-requests.module';
import { CarePlansModule } from '../care-plans/care-plans.module';

@Module({
  imports: [PrismaModule, AlertsModule, VisitRequestsModule, CarePlansModule],
  controllers: [RulesEngineController],
  providers: [RulesEngineService, RulesSeedService],
  exports: [RulesEngineService],
})
export class RulesEngineModule {}

