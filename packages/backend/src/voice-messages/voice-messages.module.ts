import { Module } from '@nestjs/common';
import { VoiceMessagesService } from './voice-messages.service';
import { VoiceMessagesController } from './voice-messages.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TranslationModule } from '../translation/translation.module';
import { AdviceModule } from '../advice/advice.module';
import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [PrismaModule, TranslationModule, AdviceModule, PatientsModule],
  controllers: [VoiceMessagesController],
  providers: [VoiceMessagesService],
  exports: [VoiceMessagesService],
})
export class VoiceMessagesModule {}

