import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import * as path from 'path';

@Controller('documents') // Routes match http://localhost:3000/documents
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // Matches form field key 'file'
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    // 1. Basic Existence Validation
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    // 2. Size Validation (Max 5 Megabytes)
    if (file.size > 5000000) {
      throw new BadRequestException('File size exceeds the 5MB limit.');
    }

    // 3. Robust Extension Validation (Perfect for crossing Windows/Linux environments)
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (fileExtension !== '.txt') {
      throw new BadRequestException(
        'Invalid file type. Only standard .txt files are allowed.',
      );
    }

    // 4. Send to service for database insertion
    return await this.documentsService.processAndSaveFile(file);
  }

  @Get()
  async getAllDocuments() {
    return await this.documentsService.findAllDocuments();
  }
}
