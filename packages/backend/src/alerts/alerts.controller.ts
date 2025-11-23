import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AlertSeverity, AlertType } from '@myhealthally/shared';

@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private alertsService: AlertsService) {}

  @Get()
  findAll() {
    return this.alertsService.findActive();
  }

  @Get('patients/:patientId')
  findByPatient(@Param('patientId') patientId: string) {
    return this.alertsService.findByPatient(patientId);
  }

  @Post()
  create(
    @Body()
    data: {
      patientId: string;
      severity: AlertSeverity;
      type: AlertType;
      title: string;
      body: string;
      payload?: Record<string, any>;
    },
  ) {
    return this.alertsService.create(data.patientId, data);
  }

  @Patch(':id/resolve')
  resolve(@Param('id') id: string, @Body() data?: { note?: string }) {
    return this.alertsService.resolve(id, data?.note);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: { status?: string; note?: string },
  ) {
    return this.alertsService.update(id, data);
  }

  @Patch(':id/dismiss')
  dismiss(@Param('id') id: string) {
    return this.alertsService.dismiss(id);
  }
}
