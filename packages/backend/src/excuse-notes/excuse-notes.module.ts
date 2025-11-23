import { Module } from '@nestjs/common';
import { ExcuseNotesService } from './excuse-notes.service';
import { ExcuseNotesController } from './excuse-notes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExcuseNotesController],
  providers: [ExcuseNotesService],
  exports: [ExcuseNotesService],
})
export class ExcuseNotesModule {}

