import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
export declare class MaterialsController {
    private readonly materialsService;
    constructor(materialsService: MaterialsService);
    create(studyId: number, user: any, dto: CreateMaterialDto): Promise<{
        study: {
            title: string;
            id: number;
            courseName: string;
        };
        uploader: {
            id: number;
            email: string;
            name: string;
        };
    } & {
        url: string;
        title: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        studyId: number;
        uploaderId: number;
    }>;
    findAll(studyId: number, user: any): Promise<({
        uploader: {
            id: number;
            email: string;
            name: string;
        };
    } & {
        url: string;
        title: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        studyId: number;
        uploaderId: number;
    })[]>;
}
