import { PollsService } from './polls.service';
import { CreatePollDto } from './dto/create-poll.dto';
export declare class PollsController {
    private readonly pollsService;
    constructor(pollsService: PollsService);
    create(studyId: number, user: any, dto: CreatePollDto): Promise<{
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
    findAll(studyId: number, user: any): Promise<({
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
    vote(optionId: number, user: any): Promise<{
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
    close(pollId: number, user: any): Promise<{
        title: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        studyId: number;
        creatorId: number;
        closed: boolean;
    }>;
}
