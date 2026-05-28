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
exports.MaterialsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MaterialsService = class MaterialsService {
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
    async checkStudyMember(studyId, userId) {
        const member = await this.prisma.studyMember.findUnique({
            where: {
                studyId_userId: {
                    studyId,
                    userId,
                },
            },
        });
        if (!member) {
            throw new common_1.ForbiddenException('Only study member can access.');
        }
        return member;
    }
    async create(studyId, userId, dto) {
        await this.checkStudyExists(studyId);
        await this.checkStudyMember(studyId, userId);
        return this.prisma.studyMaterial.create({
            data: {
                studyId,
                uploaderId: userId,
                title: dto.title,
                description: dto.description,
                url: dto.url,
            },
            include: {
                uploader: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                study: {
                    select: {
                        id: true,
                        title: true,
                        courseName: true,
                    },
                },
            },
        });
    }
    async findAll(studyId, userId) {
        await this.checkStudyExists(studyId);
        await this.checkStudyMember(studyId, userId);
        return this.prisma.studyMaterial.findMany({
            where: {
                studyId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                uploader: {
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
exports.MaterialsService = MaterialsService;
exports.MaterialsService = MaterialsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MaterialsService);
//# sourceMappingURL=materials.service.js.map