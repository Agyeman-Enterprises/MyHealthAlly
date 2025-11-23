import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messaging')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(private messagingService: MessagingService) {}

  @Post('threads')
  async createThread(
    @Request() req: any,
    @Body() data: { patientId: string; subject?: string },
  ) {
    const user = req.user;
    return this.messagingService.createThread(
      data.patientId,
      user.clinicId || '',
      data.subject,
    );
  }

  @Get('threads')
  async getThreads(@Request() req: any) {
    return this.messagingService.getThreadsForUser(req.user.id);
  }

  @Get('threads/:threadId')
  async getThread(@Param('threadId') threadId: string, @Request() req: any) {
    return this.messagingService.getThread(threadId, req.user.id);
  }

  @Post('threads/:threadId/messages')
  @UseInterceptors(FilesInterceptor('files', 5))
  async sendMessage(
    @Param('threadId') threadId: string,
    @Request() req: any,
    @Body() data: { content: string },
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const attachments = files?.map((file) => ({
      type: file.mimetype,
      url: `/uploads/${file.filename}`,
      filename: file.originalname,
      size: file.size,
    }));

    return this.messagingService.sendMessage(
      threadId,
      req.user.id,
      data.content,
      attachments,
    );
  }

  @Post('messages/:messageId/read')
  async markAsRead(@Param('messageId') messageId: string, @Request() req: any) {
    return this.messagingService.markAsRead(messageId, req.user.id);
  }

  @Post('threads/:threadId/read')
  async markThreadAsRead(
    @Param('threadId') threadId: string,
    @Request() req: any,
  ) {
    return this.messagingService.markThreadAsRead(threadId, req.user.id);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    const count = await this.messagingService.getUnreadCount(req.user.id);
    return { count };
  }
}
