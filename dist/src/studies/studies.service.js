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
exports.StudiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StudiesService = class StudiesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const study = await tx.study.create({
                data: {
                    title: dto.title,
                    description: dto.description,
                    courseName: dto.courseName,
                    maxMembers: dto.maxMembers,
                    leaderId: userId,
                },
            });
            await tx.studyMember.create({
                data: {
                    studyId: study.id,
                    userId,
                    role: 'LEADER',
                },
            });
            return study;
        });
    }
    async findAll() {
        const studies = await this.prisma.study.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                leader: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                members: {
                    select: {
                        id: true,
                        userId: true,
                        role: true,
                    },
                },
                _count: {
                    select: {
                        members: true,
                        applications: true,
                    },
                },
            },
        });
        return studies.map((study) => ({
            id: study.id,
            title: study.title,
            description: study.description,
            courseName: study.courseName,
            maxMembers: study.maxMembers,
            currentMembers: study._count.members,
            pendingApplications: study._count.applications,
            leader: study.leader,
            createdAt: study.createdAt,
            updatedAt: study.updatedAt,
        }));
    }
    async findOne(studyId) {
        const study = await this.prisma.study.findUnique({
            where: {
                id: studyId,
            },
            include: {
                leader: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                members: {
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
                materials: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                polls: {
                    include: {
                        options: {
                            include: {
                                _count: {
                                    select: {
                                        votes: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                _count: {
                    select: {
                        members: true,
                        applications: true,
                    },
                },
            },
        });
        if (!study) {
            throw new common_1.NotFoundException('Cannot find study');
        }
        return {
            id: study.id,
            title: study.title,
            description: study.description,
            courseName: study.courseName,
            maxMembers: study.maxMembers,
            currentMembers: study._count.members,
            pendingApplications: study._count.applications,
            leader: study.leader,
            members: study.members,
            materials: study.materials,
            polls: study.polls,
            createdAt: study.createdAt,
            updatedAt: study.updatedAt,
        };
    }
    async findStudyOrThrow(studyId) {
        const study = await this.prisma.study.findUnique({
            where: {
                id: studyId,
            },
        });
        if (!study) {
            throw new common_1.NotFoundException('Cannot find a study.');
        }
        return study;
    }
    async leaveStudy(studyId, userId) {
        const study = await this.findStudyOrThrow(studyId);
        if (study.leaderId === userId) {
            throw new common_1.BadRequestException('Study leader cannot leave.');
        }
        const member = await this.prisma.studyMember.findUnique({
            where: {
                studyId_userId: {
                    studyId,
                    userId,
                },
            },
        });
        if (!member) {
            throw new common_1.ForbiddenException('Not a member of the study.');
        }
        await this.prisma.studyMember.delete({
            where: {
                studyId_userId: {
                    studyId,
                    userId,
                },
            },
        });
        return {
            message: 'Leaved from study.',
            studyId,
            userId,
        };
    }
    async removeMember(studyId, targetUserId, requesterId) {
        const study = await this.findStudyOrThrow(studyId);
        if (study.leaderId !== requesterId) {
            throw new common_1.ForbiddenException('Only study leader can remove member.');
        }
        if (targetUserId === requesterId) {
            throw new common_1.BadRequestException('Study leader cannot remove himself.');
        }
        if (targetUserId === study.leaderId) {
            throw new common_1.BadRequestException('Study leader cannot remove himself.');
        }
        const targetMember = await this.prisma.studyMember.findUnique({
            where: {
                studyId_userId: {
                    studyId,
                    userId: targetUserId,
                },
            },
        });
        if (!targetMember) {
            throw new common_1.NotFoundException('Not a study member.');
        }
        if (targetMember.role === 'LEADER') {
            throw new common_1.BadRequestException('Study leader cannot remove himself.');
        }
        await this.prisma.studyMember.delete({
            where: {
                studyId_userId: {
                    studyId,
                    userId: targetUserId,
                },
            },
        });
        return {
            message: 'Removed study member.',
            studyId,
            removedUserId: targetUserId,
        };
    }
};
exports.StudiesService = StudiesService;
exports.StudiesService = StudiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudiesService);
//# sourceMappingURL=studies.service.js.map