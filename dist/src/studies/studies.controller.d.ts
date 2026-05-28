import { StudiesService } from './studies.service';
import { CreateStudyDto } from './dto/create-study.dto';
export declare class StudiesController {
    private readonly studiesService;
    constructor(studiesService: StudiesService);
    create(user: any, dto: CreateStudyDto): Promise<{
        title: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        courseName: string;
        maxMembers: number;
        leaderId: number;
    }>;
    findAll(): Promise<{
        id: number;
        title: string;
        description: string;
        courseName: string;
        maxMembers: number;
        currentMembers: number;
        pendingApplications: number;
        leader: {
            id: number;
            email: string;
            name: string;
        };
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(studyId: number): Promise<{
        id: number;
        title: string;
        description: string;
        courseName: string;
        maxMembers: number;
        currentMembers: number;
        pendingApplications: number;
        leader: {
            id: number;
            email: string;
            name: string;
        };
        members: ({
            user: {
                id: number;
                email: string;
                name: string;
            };
        } & {
            id: number;
            role: import("@prisma/client").$Enums.StudyRole;
            createdAt: Date;
            studyId: number;
            userId: number;
        })[];
        materials: {
            url: string;
            title: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            studyId: number;
            uploaderId: number;
        }[];
        polls: ({
            options: ({
                _count: {
                    votes: number;
                };
            } & {
                id: number;
                createdAt: Date;
                dateTime: Date;
                pollId: number;
            })[];
        } & {
            title: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            studyId: number;
            creatorId: number;
            closed: boolean;
        })[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    leaveStudy(studyId: number, user: any): Promise<{
        message: string;
        studyId: number;
        userId: number;
    }>;
    removeMember(studyId: number, targetUserId: number, user: any): Promise<{
        message: string;
        studyId: number;
        removedUserId: number;
    }>;
}
