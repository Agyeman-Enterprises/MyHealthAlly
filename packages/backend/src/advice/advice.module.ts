import { Module } from '@nestjs/common';
import { AdviceService } from './advice.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TranslationModule } from '../translation/translation.module';
import { PatientsLanguageService } from '../patients/patients-language.service';

@Module({
  imports: [PrismaModule, TranslationModule],
  providers: [AdviceService, PatientsLanguageService],
  exports: [AdviceService],
})
export class AdviceModule {}

