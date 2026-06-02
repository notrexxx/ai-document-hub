import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Document } from '../documents/entities/document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document])], // Gives the service access to the Documents table
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}