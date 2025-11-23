import { Module } from '@nestjs/common';
import { DeviceWebhooksController } from './device-webhooks.controller';
import { DeviceWebhooksService } from './device-webhooks.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DeviceWebhooksController],
  providers: [DeviceWebhooksService],
})
export class DeviceWebhooksModule {}

