import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TriageService } from './triage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('triage')
@UseGuards(JwtAuthGuard)
export class TriageController {
  constructor(private triageService: TriageService) {}

  @Get('tasks')
  async getTasks(
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('intentType') intentType?: string,
    @Query('patientId') patientId?: string,
  ) {
    return this.triageService.getTasks({
      status,
      severity,
      intentType,
      patientId,
    });
  }

  @Get('tasks/:id')
  async getTaskById(@Param('id') id: string) {
    return this.triageService.getTaskById(id);
  }

  @Patch('tasks/:id')
  async updateTask(
    @Param('id') id: string,
    @Body()
    updates: {
      status?: string;
      severity?: string;
      notes?: string;
      assignedMAId?: string;
      actionNote?: string;
      handledByUserId?: string;
      handledByRole?: string;
      firstActionAt?: string;
    },
  ) {
    return this.triageService.updateTask(id, updates);
  }

  @Post('tasks/:id/close')
  async closeTask(
    @Param('id') id: string,
    @Body()
    data: {
      actionNote: string;
      handledByUserId: string;
      handledByRole: string;
    },
  ) {
    return this.triageService.closeTask(id, data);
  }

  @Get('tasks/:id/logs')
  async getTaskLogs(@Param('id') id: string) {
    return this.triageService.getTaskLogs(id);
  }

  @Post('tasks/:id/logs')
  async addTaskLog(
    @Param('id') id: string,
    @Request() req: any,
    @Body()
    log: {
      actionType: string;
      details?: any;
    },
  ) {
    return this.triageService.addTaskLog(id, {
      actorId: req.user.id,
      actorRole: req.user.role,
      actionType: log.actionType,
      details: log.details,
    });
  }

  @Post('tasks/mark-overdue')
  async markOverdueTasks() {
    return this.triageService.markOverdueTasks();
  }
}

