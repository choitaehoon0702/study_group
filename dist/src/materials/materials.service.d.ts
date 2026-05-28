import { PrismaService } from '../prisma/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
export declare class MaterialsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private checkStudyExists;
    private checkStudyMember;
    create(studyId: number, userId: number, dto: CreateMaterialDto): Promise<{
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
    findAll(studyId: number, userId: number): Promise<({
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
