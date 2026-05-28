import { ApplicationsService } from './applications.service';
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    apply(studyId: number, user: any): Promise<{
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
    findMyApplications(user: any): Promise<({
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
    findStudyApplications(studyId: number, user: any): Promise<({
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
    approve(applicationId: number, user: any): Promise<{
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
    reject(applicationId: number, user: any): Promise<{
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
