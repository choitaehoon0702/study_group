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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PollsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PollsService = class PollsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkStudyExists(studyId) {
        const study = await this.prisma.study.findUnique({
            where: {
                id: studyId,
            },
        });
        if (!study) {
            throw new common_1.NotFoundException('Cannot find a study');
        }
        return study;
    }
    async checkStudyLeader(studyId, userId) {
        const study = await this.checkStudyExists(studyId);
        if (study.leaderId !== userId) {
            throw new common_1.ForbiddenException('Only study leader can access');
        }
        return study;
    }
    async checkStudyMember(studyId, userId) {
        await this.checkStudyExists(studyId);
        const member = await this.prisma.studyMember.findUnique({
            where: {
                studyId_userId: {
                    studyId,
                    userId,
                },
            },
        });
        if (!member) {
            throw new common_1.ForbiddenException('Only study member can access');
        }
        return member;
    }
    async create(studyId, userId, dto) {
        await this.checkStudyLeader(studyId, userId);
        return this.prisma.studyPoll.create({
            data: {
                studyId,
                creatorId: userId,
                title: dto.title,
                options: {
                    create: dto.options.map((dateTime) => ({
                        dateTime: new Date(dateTime),
                    })),
                },
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                options: {
                    orderBy: {
                        dateTime: 'asc',
                    },
                    include: {
                        _count: {
                            select: {
                                votes: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async findAll(studyId, userId) {
        await this.checkStudyMember(studyId, userId);
        return this.prisma.studyPoll.findMany({
            where: {
                studyId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                options: {
                    orderBy: {
                        dateTime: 'asc',
                    },
                    include: {
                        votes: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                        _count: {
                            select: {
                                votes: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async vote(optionId, userId) {
        const option = await this.prisma.studyPollOption.findUnique({
            where: {
                id: optionId,
            },
            include: {
                poll: {
                    include: {
                        study: true,
                    },
                },
            },
        });
        if (!option) {
            throw new common_1.NotFoundException('Cannot find vote option');
        }
        const poll = option.poll;
        if (poll.closed) {
            throw new common_1.BadRequestException('Closed vote');
        }
        await this.checkStudyMember(poll.studyId, userId);
        const existingVote = await this.prisma.studyPollVote.findUnique({
            where: {
                pollOptionId_userId: {
                    pollOptionId: optionId,
                    userId,
                },
            },
        });
        if (existingVote) {
            throw new common_1.BadRequestException('Already voted');
        }
        return this.prisma.studyPollVote.create({
            data: {
                pollOptionId: optionId,
                userId,
            },
            include: {
                option: {
                    include: {
                        poll: {
                            select: {
                                id: true,
                                title: true,
                                studyId: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async close(pollId, userId) {
        const poll = await this.prisma.studyPoll.findUnique({
            where: {
                id: pollId,
            },
            include: {
                study: true,
            },
        });
        if (!poll) {
            throw new common_1.NotFoundException('Cannot find a vote');
        }
        if (poll.study.leaderId !== userId) {
            throw new common_1.ForbiddenException('Only study leader can close the vote');
        }
        return this.prisma.studyPoll.update({
            where: {
                id: pollId,
            },
            data: {
                closed: true,
            },
        });
    }
};
exports.PollsService = PollsService;
exports.PollsService = PollsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PollsService);
//# sourceMappingURL=polls.service.js.map