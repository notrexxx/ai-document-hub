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

    // 3. Robust Extension Validation (Now supports TXT, MD, and PDF)
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.txt', '.md', '.pdf'];
    
    if (!allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        'Invalid file type. Only standard .txt, .md, or .pdf files are allowed.',
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