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
const openai_1 = __importDefault(require("openai"));
let ChatService = class ChatService {
    documentRepository;
    openai;
    constructor(documentRepository) {
        this.documentRepository = documentRepository;
        const apiKey = process.env.OPENAI_API_KEY;
        this.openai = new openai_1.default({
            apiKey: apiKey,
        });
    }
    async askDocument(documentId, question) {
        const document = await this.documentRepository.findOne({ where: { id: documentId } });
        if (!document) {
            throw new common_1.NotFoundException(`Document with ID ${documentId} not found.`);
        }
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
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
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(document_entity_1.Document)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ChatService);
//# sourceMappingURL=chat.service.js.map