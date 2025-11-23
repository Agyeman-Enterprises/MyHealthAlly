import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RulesEngineService } from './rules-engine.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClinicalRule } from '@myhealthally/shared';

@Controller('rules')
@UseGuards(JwtAuthGuard)
export class RulesEngineController {
  constructor(private rulesEngineService: RulesEngineService) {}

  @Get()
  async getRules() {
    return this.rulesEngineService.getRules();
  }

  @Post()
  async createRule(@Body() data: Partial<ClinicalRule>) {
    return this.rulesEngineService.createRule(data);
  }

  @Put(':id')
  async updateRule(
    @Param('id') id: string,
    @Body() data: Partial<ClinicalRule>,
  ) {
    return this.rulesEngineService.updateRule(id, data);
  }

  @Delete(':id')
  async deleteRule(@Param('id') id: string) {
    await this.rulesEngineService.deleteRule(id);
    return { success: true };
  }

  @Post('evaluate/:patientId')
  async evaluatePatient(@Param('patientId') patientId: string) {
    await this.rulesEngineService.evaluateRulesForPatient(patientId);
    return { success: true };
  }
}
