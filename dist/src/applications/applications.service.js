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
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ApplicationsService = class ApplicationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async apply(studyId, userId) {
        const study = await this.prisma.study.findUnique({
            where: {
                id: studyId,
            },
            include: {
                _count: {
                    select: {
                        members: true,
                    },
                },
            },
        });
        if (!study) {
            throw new common_1.NotFoundException('Cannot find a study');
        }
        const existingMember = await this.prisma.studyMember.findUnique({
            where: {
                studyId_userId: {
                    studyId,
                    userId,
                },
            },
        });
        if (existingMember) {
            throw new common_1.BadRequestException('Already joined');
        }
        const existingApplication = await this.prisma.studyApplication.findUnique({
            where: {
                studyId_userId: {
                    studyId,
                    userId,
                },
            },
        });
        if (existingApplication) {
            throw new common_1.BadRequestException('Already requested');
        }
        if (study._count.members >= study.maxMembers) {
            throw new common_1.BadRequestException('Study member is already full');
        }
        const application = await this.prisma.studyApplication.create({
            data: {
                studyId,
                userId,
                status: 'PENDING',
            },
            include: {
                study: {
                    select: {
                        id: true,
                        title: true,
                        courseName: true,
                        maxMembers: true,
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
        return application;
    }
    async findMyApplications(userId) {
        return this.prisma.studyApplication.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                study: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        courseName: true,
                        maxMembers: true,
                        leader: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                        _count: {
                            select: {
                                members: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async findStudyApplications(studyId, userId) {
        const study = await this.prisma.study.findUnique({
            where: {
                id: studyId,
            },
        });
        if (!study) {
            throw new common_1.NotFoundException('Cannot find a study');
        }
        if (study.leaderId !== userId) {
            throw new common_1.ForbiddenException('Only study leader can view this.');
        }
        return this.prisma.studyApplication.findMany({
            where: {
                studyId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
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
    async approve(applicationId, leaderId) {
        const application = await this.prisma.studyApplication.findUnique({
            where: {
                id: applicationId,
            },
            include: {
                study: {
                    include: {
                        _count: {
                            select: {
                                members: true,
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
        if (!application) {
            throw new common_1.NotFoundException('Cannot find application info.');
        }
        if (application.study.leaderId !== leaderId) {
            throw new common_1.ForbiddenException('Only study leader can approve.');
        }
        if (application.status !== 'PENDING') {
            throw new common_1.BadRequestException('Already handled request');
        }
        const existingMember = await this.prisma.studyMember.findUnique({
            where: {
                studyId_userId: {
                    studyId: application.studyId,
                    userId: application.userId,
                },
            },
        });
        if (existingMember) {
            throw new common_1.BadRequestException('Already member of study');
        }
        if (application.study._count.members >= application.study.maxMembers) {
            throw new common_1.BadRequestException('Study member is already full');
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedApplication = await tx.studyApplication.update({
                where: {
                    id: applicationId,
                },
                data: {
                    status: 'APPROVED',
                },
                include: {
                    study: {
                        select: {
                            id: true,
                            title: true,
                            courseName: true,
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
            await tx.studyMember.create({
                data: {
                    studyId: application.studyId,
                    userId: application.userId,
                    role: 'MEMBER',
                },
            });
            return updatedApplication;
        });
    }
    async reject(applicationId, leaderId) {
        const application = await this.prisma.studyApplication.findUnique({
            where: {
                id: applicationId,
            },
            include: {
                study: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Cannot find application info.');
        }
        if (application.study.leaderId !== leaderId) {
            throw new common_1.ForbiddenException('Only study leader can approve.');
        }
        if (application.status !== 'PENDING') {
            throw new common_1.BadRequestException('Already handled request.');
        }
        return this.prisma.studyApplication.update({
            where: {
                id: applicationId,
            },
            data: {
                status: 'REJECTED',
            },
            include: {
                study: {
                    select: {
                        id: true,
                        title: true,
                        courseName: true,
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
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map