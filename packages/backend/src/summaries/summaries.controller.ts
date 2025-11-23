import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SummariesService } from './summaries.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('patients/:patientId/summaries')
@UseGuards(JwtAuthGuard)
export class SummariesController {
  constructor(private summariesService: SummariesService) {}

  @Get()
  async getSummaries(@Param('patientId') patientId: string) {
    return this.summariesService.getSummaries(patientId);
  }
}
