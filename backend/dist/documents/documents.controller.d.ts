import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    uploadFile(file: Express.Multer.File): Promise<import("./entities/document.entity").Document>;
    getAllDocuments(): Promise<import("./entities/document.entity").Document[]>;
}
