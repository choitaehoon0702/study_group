import { PrismaService } from '../prisma/prisma.service';
export declare class ApplicationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    apply(studyId: number, userId: number): Promise<{
        user: {
            id: number;
            email: string;
            name: string;
        };
        study: {
            title: string;
            id: number;
            courseName: string;
            maxMembers: number;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        studyId: number;
        userId: number;
        message: string | null;
        status: import("@prisma/client").$Enums.ApplicationStatus;
    }>;
    findMyApplications(userId: number): Promise<({
        study: {
            title: string;
            id: number;
            _count: {
                members: number;
            };
            description: string;
            courseName: string;
            maxMembers: number;
            leader: {
                id: number;
                email: string;
                name: string;
            };
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        studyId: number;
        userId: number;
        message: string | null;
        status: import("@prisma/client").$Enums.ApplicationStatus;
    })[]>;
    findStudyApplications(studyId: number, userId: number): Promise<({
        user: {
            id: number;
            email: string;
            name: string;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        studyId: number;
        userId: number;
        message: string | null;
        status: import("@prisma/client").$Enums.ApplicationStatus;
    })[]>;
    approve(applicationId: number, leaderId: number): Promise<{
        user: {
            id: number;
            email: string;
            name: string;
        };
        study: {
            title: string;
            id: number;
            courseName: string;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        studyId: number;
        userId: number;
        message: string | null;
        status: import("@prisma/client").$Enums.ApplicationStatus;
    }>;
    reject(applicationId: number, leaderId: number): Promise<{
        user: {
            id: number;
            email: string;
            name: string;
        };
        study: {
            title: string;
            id: number;
            courseName: string;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        studyId: number;
        userId: number;
        message: string | null;
        status: import("@prisma/client").$Enums.ApplicationStatus;
    }>;
}
