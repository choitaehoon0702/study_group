import { PrismaService } from '../prisma/prisma.service';
import { CreatePollDto } from './dto/create-poll.dto';
export declare class PollsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private checkStudyExists;
    private checkStudyLeader;
    private checkStudyMember;
    create(studyId: number, userId: number, dto: CreatePollDto): Promise<{
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
        creator: {
            id: number;
            email: string;
            name: string;
        };
    } & {
        title: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        studyId: number;
        creatorId: number;
        closed: boolean;
    }>;
    findAll(studyId: number, userId: number): Promise<({
        options: ({
            votes: ({
                user: {
                    id: number;
                    email: string;
                    name: string;
                };
            } & {
                id: number;
                createdAt: Date;
                userId: number;
                pollOptionId: number;
            })[];
            _count: {
                votes: number;
            };
        } & {
            id: number;
            createdAt: Date;
            dateTime: Date;
            pollId: number;
        })[];
        creator: {
            id: number;
            email: string;
            name: string;
        };
    } & {
        title: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        studyId: number;
        creatorId: number;
        closed: boolean;
    })[]>;
    vote(optionId: number, userId: number): Promise<{
        option: {
            poll: {
                title: string;
                id: number;
                studyId: number;
            };
        } & {
            id: number;
            createdAt: Date;
            dateTime: Date;
            pollId: number;
        };
        user: {
            id: number;
            email: string;
            name: string;
        };
    } & {
        id: number;
        createdAt: Date;
        userId: number;
        pollOptionId: number;
    }>;
    close(pollId: number, userId: number): Promise<{
        title: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        studyId: number;
        creatorId: number;
        closed: boolean;
    }>;
}
