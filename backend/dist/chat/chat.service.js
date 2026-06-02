"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const document_entity_1 = require("../documents/entities/document.entity");
const config_1 = require("@nestjs/config");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
let ChatService = class ChatService {
    documentRepository;
    configService;
    groq;
    constructor(documentRepository, configService) {
        this.documentRepository = documentRepository;
        this.configService = configService;
        const envKey = this.configService.get('GROQ_API_KEY');
        const backupKey = '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';
        this.groq = new groq_sdk_1.default({
            apiKey: envKey || backupKey,
        });
    }
    async askDocument(documentId, question) {
        const document = await this.documentRepository.findOne({ where: { id: documentId } });
        if (!document) {
            throw new common_1.NotFoundException(`Document with ID ${documentId} not found.`);
        }
        try {
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
        }
        catch (error) {
            console.error('Groq API Error:', error);
            throw new common_1.InternalServerErrorException('Failed to communicate with the AI engine.');
        }
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(document_entity_1.Document)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], ChatService);
//# sourceMappingURL=chat.service.js.map