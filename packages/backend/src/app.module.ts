import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClinicsModule } from './clinics/clinics.module';
import { PatientsModule } from './patients/patients.module';
import { MeasurementsModule } from './measurements/measurements.module';
import { CarePlansModule } from './care-plans/care-plans.module';
import { AlertsModule } from './alerts/alerts.module';
import { VisitRequestsModule } from './visit-requests/visit-requests.module';
import { RulesEngineModule } from './rules-engine/rules-engine.module';
import { MessagingModule } from './messaging/messaging.module';
import { HealthModule } from './health/health.module';
import { SummariesModule } from './summaries/summaries.module';
import { VideoModule } from './video/video.module';
import { PrismaModule } from './prisma/prisma.module';
import { SlotsModule } from './slots/slots.module';
import { VisitsModule } from './visits/visits.module';
import { VirtualVisitsModule } from './virtual-visits/virtual-visits.module';
import { DeviceWebhooksModule } from './device-webhooks/device-webhooks.module';
import { LabOrdersModule } from './lab-orders/lab-orders.module';
import { ReferralsModule } from './referrals/referrals.module';
import { ExcuseNotesModule } from './excuse-notes/excuse-notes.module';
import { AppConfigModule } from './config/config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ClinicsModule,
    PatientsModule,
    MeasurementsModule,
    CarePlansModule,
    AlertsModule,
    VisitRequestsModule,
    RulesEngineModule,
    MessagingModule,
    HealthModule,
    SummariesModule,
    VideoModule,
    SlotsModule,
    VisitsModule,
    VirtualVisitsModule,
    DeviceWebhooksModule,
    LabOrdersModule,
    ReferralsModule,
    ExcuseNotesModule,
    AppConfigModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
