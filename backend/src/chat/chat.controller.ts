import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat') // Routes start with http://localhost:3000/chat
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('ask')
  async askQuestion(
    @Body('documentId') documentId: string,
    @Body('question') question: string,
  ) {
    if (!documentId || !question) {
      throw new BadRequestException('Both documentId and question fields are strictly required.');
    }
    return await this.chatService.askDocument(documentId, question);
  }
}