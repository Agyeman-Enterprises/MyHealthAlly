import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      message: 'MyHealthAlly API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/health',
        auth: '/auth',
        patients: '/patients',
        clinician: '/clinician',
        admin: '/admin',
      },
      docs: 'API documentation available at /health',
    };
  }
}

