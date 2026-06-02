// backend/src/chat/chat.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('ask')
  async askQuestion(
    @Body('documentId') documentId: string,
    @Body('question') question: string,
  ) {
    // Calling askQuestion to match the updated ChatService implementation
    return await this.chatService.askQuestion(documentId, question);
  }
}
