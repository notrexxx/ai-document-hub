import { Repository } from 'typeorm';
import { Document } from '../documents/entities/document.entity';
import { ConfigService } from '@nestjs/config';
export declare class ChatService {
    private readonly documentRepository;
    private readonly configService;
    private groq;
    constructor(documentRepository: Repository<Document>, configService: ConfigService);
    askDocument(documentId: string, question: string): Promise<{
        answer: string;
    }>;
}
