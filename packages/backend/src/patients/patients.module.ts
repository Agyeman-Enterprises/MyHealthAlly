import { Module } from '@nestjs/common';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { AnalyticsController } from './analytics.controller';
import { PatientsLanguageService } from './patients-language.service';
import { PatientsLanguagePromptService } from './patients-language-prompt.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TranslationModule } from '../translation/translation.module';

@Module({
  imports: [PrismaModule, TranslationModule],
  controllers: [PatientsController, AnalyticsController],
  providers: [PatientsService, PatientsLanguageService, PatientsLanguagePromptService],
  exports: [PatientsService, PatientsLanguageService],
})
export class PatientsModule {}
