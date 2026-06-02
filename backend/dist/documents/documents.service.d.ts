import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
export declare class DocumentsService {
    private readonly documentRepository;
    constructor(documentRepository: Repository<Document>);
    processAndSaveFile(file: Express.Multer.File): Promise<Document>;
    findAllDocuments(): Promise<Document[]>;
}
