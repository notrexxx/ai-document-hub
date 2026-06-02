import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentsModule } from './documents/documents.module';
import { Document } from './documents/entities/document.entity';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    // 1. Load the hidden .env file globally across the app
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // 2. Boot up the SQLite Database Engine and register entities
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'database.sqlite',
      entities: [Document],
      synchronize: true, // Automatically updates database schema; disable in production
    }),

    // 3. Register feature modules
    DocumentsModule,

    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}