// backend/src/main.ts

// 1. Load environment variables BEFORE any NestJS modules are imported
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// 2. Now it is safe to import the rest of the application
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS securely for your local development connections
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  Logger.log(`🚀 Server successfully launched running on: http://localhost:${port}`, 'Bootstrap');
}
bootstrap();