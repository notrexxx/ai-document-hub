import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Notice the updated import path here!
import { Document } from '../documents/entities/document.entity'; 
import { Groq } from 'groq-sdk';

@Injectable()
export class ChatService {
  private groq: Groq;

  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {
    // 1. Initialize Groq securely using the environment variable
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not defined in the environment variables');
    }
    
    this.groq = new Groq({
      apiKey: apiKey,
    });
  }

  async askQuestion(documentId: string, question: string) {
    // 2. Retrieve the document from SQLite
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    try {
      // 3. Send the document content and the user's question to Llama 3.1
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

      // 4. Return the AI's answer
      return {
        answer: chatCompletion.choices[0]?.message?.content || 'No response generated.',
      };
    } catch (error) {
      console.error('Groq API Error:', error);
      throw new Error('Failed to generate response from the AI model.');
    }
  }
}