import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../documents/entities/document.entity';
import { Groq } from 'groq-sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Force dotenv to load the file using an absolute path to bypass TypeScript hoisting
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

@Injectable()
export class ChatService {
  private groq: Groq;

  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error('GROQ_API_KEY is missing. The .env file was not loaded correctly.');
    }

    this.groq = new Groq({
      apiKey: apiKey,
    });

    Logger.log('✅ API Key successfully loaded securely from .env!', 'ChatService');
  }

  async askQuestion(documentId: string, question: string) {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI assistant. Answer the user's question based strictly on the following document content. If the answer is not in the document, say "I cannot answer this based on the provided document."\n\nDocument Content:\n${document.content}`,
          },
          {
            role: 'user',
            content: question,
          },
        ],
        model: 'llama-3.1-8b-instant', 
        temperature: 0.1, 
      });

      return {
        answer: chatCompletion.choices[0]?.message?.content || 'No response generated.',
      };
    } catch (error) {
      console.error('Groq API Error:', error);
      throw new Error('Failed to generate response from the AI model.');
    }
  }
}