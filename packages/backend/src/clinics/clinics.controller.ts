import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('clinics')
@UseGuards(JwtAuthGuard)
export class ClinicsController {
  constructor(private clinicsService: ClinicsService) {}

  @Post()
  create(@Body() data: { name: string; brandingConfig?: any }) {
    return this.clinicsService.create(data);
  }

  @Get()
  findAll() {
    return this.clinicsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clinicsService.findOne(id);
  }
}
