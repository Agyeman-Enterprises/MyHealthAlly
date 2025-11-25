import { Module } from '@nestjs/common';
import { CarePlansController } from './care-plans.controller';
import { CarePlansService } from './care-plans.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TranslationModule } from '../translation/translation.module';
import { PatientsLanguageService } from '../patients/patients-language.service';

@Module({
  imports: [PrismaModule, TranslationModule],
  controllers: [CarePlansController],
  providers: [CarePlansService, PatientsLanguageService],
  exports: [CarePlansService],
})
export class CarePlansModule {}
