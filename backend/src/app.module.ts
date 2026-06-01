import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // 1. Load the hidden .env file
    ConfigModule.forRoot({
      isGlobal: true, // Makes the API keys available everywhere
    }),
    
    // 2. Boot up the SQLite Database Engine
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'database.sqlite', // It will create this file automatically
      entities: [], // We will add our Document/Chat entities here later
      synchronize: true, // Auto-creates tables (Great for dev, turn off in prod!)
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}