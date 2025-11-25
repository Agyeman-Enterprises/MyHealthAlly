import { Module } from '@nestjs/common';
import { TranslationService } from './translation.service';

@Module({
  providers: [TranslationService],
  exports: [TranslationService],
})
export class TranslationModule {}

// Export cultural templates for use in other modules
export { COFATranslationGuidelines, COFACulturalTemplates } from './cultural-templates';

