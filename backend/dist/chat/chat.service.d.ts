import { Repository } from 'typeorm';
import { Document } from '../documents/entities/document.entity';
export declare class ChatService {
    private readonly documentRepository;
    private openai;
    constructor(documentRepository: Repository<Document>);
    askDocument(documentId: string, question: string): Promise<{
        answer: string;
    }>;
}
