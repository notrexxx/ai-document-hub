import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    askQuestion(documentId: string, question: string): Promise<{
        answer: string;
    }>;
}
