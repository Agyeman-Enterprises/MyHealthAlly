import { Controller, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { DeviceWebhooksService } from './device-webhooks.service';

@Controller('device/webhook')
export class DeviceWebhooksController {
  constructor(private deviceWebhooksService: DeviceWebhooksService) {}

  @Post('oura')
  @HttpCode(HttpStatus.OK)
  async ouraWebhook(@Body() body: any, @Headers('x-oura-signature') signature?: string) {
    // TODO: Verify signature
    return this.deviceWebhooksService.processOuraWebhook(body);
  }

  @Post('fitbit')
  @HttpCode(HttpStatus.OK)
  async fitbitWebhook(@Body() body: any, @Headers('x-fitbit-signature') signature?: string) {
    // TODO: Verify signature
    return this.deviceWebhooksService.processFitbitWebhook(body);
  }

  @Post('garmin')
  @HttpCode(HttpStatus.OK)
  async garminWebhook(@Body() body: any, @Headers('x-garmin-signature') signature?: string) {
    // TODO: Verify signature
    return this.deviceWebhooksService.processGarminWebhook(body);
  }

  @Post('withings')
  @HttpCode(HttpStatus.OK)
  async withingsWebhook(@Body() body: any, @Headers('x-withings-signature') signature?: string) {
    // TODO: Verify signature
    return this.deviceWebhooksService.processWithingsWebhook(body);
  }
}

