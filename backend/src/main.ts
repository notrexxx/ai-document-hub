import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Add this line to allow your React Web build to talk to the backend!
  app.enableCors();

  await app.listen(3000);
}
bootstrap();