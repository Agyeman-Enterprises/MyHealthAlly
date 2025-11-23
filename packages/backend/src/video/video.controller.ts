import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('video')
@UseGuards(JwtAuthGuard)
export class VideoController {
  constructor(private videoService: VideoService) {}

  @Post('room/create')
  async createRoom(
    @Request() req: any,
    @Body() data: { patientId: string; providerId?: string },
  ) {
    return this.videoService.createRoom(data.patientId, data.providerId);
  }

  @Get('room/:roomName/token')
  async getRoomToken(@Param('roomName') roomName: string, @Request() req: any) {
    const isOwner = req.user.role === 'PATIENT';
    return {
      token: await this.videoService.getRoomToken(
        roomName,
        req.user.id,
        isOwner,
      ),
    };
  }
}
