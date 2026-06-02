import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../documents/entities/document.entity';
import OpenAI from 'openai';

@Injectable()
export class ChatService {
  private openai: OpenAI;

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {
    // Read directly from process.env to ensure it hits the loaded environment variables
    const apiKey = process.env.OPENAI_API_KEY;

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async askDocument(documentId: string, question: string): Promise<{ answer: string }> {
    // 1. Fetch the specific document text from SQLite
    const document = await this.documentRepository.findOne({ where: { id: documentId } });
    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found.`);
    }

    // 2. Orchestrate the secure payload for OpenAI
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini', // Fast, cheap, and perfect for MVP context feeding
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
      temperature: 0.3, // Keeps the AI focused tightly on your document data
    });

    // 3. Return the clean text answer
    return {
      answer: response.choices[0].message.content || 'No response generated.',
    };
  }
}