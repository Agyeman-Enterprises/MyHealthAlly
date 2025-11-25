import { Module } from '@nestjs/common';
import { ClinicalNotesService } from './clinical-notes.service';
import { ClinicalNotesController } from './clinical-notes.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TranslationModule } from '../translation/translation.module';

@Module({
  imports: [PrismaModule, TranslationModule],
  providers: [ClinicalNotesService],
  controllers: [ClinicalNotesController],
  exports: [ClinicalNotesService],
})
export class ClinicalNotesModule {}

