import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  // 1. Process the uploaded file
  async processAndSaveFile(file: Express.Multer.File): Promise<Document> {
    if (!file) {
      throw new BadRequestException('No file provided.');
    }

    // Convert the raw file memory buffer into a readable string
    const extractedText = file.buffer.toString('utf-8');

    // Prepare the database record
    const newDocument = this.documentRepository.create({
      filename: file.originalname,
      content: extractedText,
    });

    // Save it permanently to SQLite
    return await this.documentRepository.save(newDocument);
  }

  // 2. Fetch all saved documents (useful for our future frontend dashboard)
  async findAllDocuments(): Promise<Document[]> {
    return await this.documentRepository.find({
      order: { createdAt: 'DESC' } // Newest first
    });
  }
}