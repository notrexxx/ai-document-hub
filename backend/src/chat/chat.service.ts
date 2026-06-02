import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../documents/entities/document.entity';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

@Injectable()
export class ChatService {
  private groq: Groq;

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly configService: ConfigService, 
  ) {
    // 1. Try to fetch the key cleanly from the environment module
    const envKey = this.configService.get<string>('GROQ_API_KEY');
    
    // 2. Fail-safe backup key to bypass Windows/NestJS configuration load sync issues
    const backupKey = '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';

    this.groq = new Groq({
      apiKey: envKey || backupKey, 
    });
  }

  async askDocument(documentId: string, question: string): Promise<{ answer: string }> {
    // Fetch the document text out of the SQLite database
    const document = await this.documentRepository.findOne({ where: { id: documentId } });
    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found.`);
    }

    try {
      // Execute the context payload using Llama 3.1
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant', 
        messages: [
          {
            role: 'system',
            content: `You are an expert data analyst assistant. Use the following document context to answer the user's question accurately. If the answer cannot be found in the context, politely state that it isn't in the text.
            
            --- DOCUMENT CONTEXT ---
            ${document.content}`,
          },
          {
            role: 'user',
            content: question,
          },
        ],
        temperature: 0.3, 
      });

      return {
        answer: response.choices[0].message.content || 'No response generated.',
      };
    } catch (error) {
      console.error('Groq API Error:', error);
      throw new InternalServerErrorException('Failed to communicate with the AI engine.');
    }
  }
}