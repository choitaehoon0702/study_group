import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  private async checkStudyExists(studyId: number) {
    const study = await this.prisma.study.findUnique({
      where: {
        id: studyId,
      },
    });

    if (!study) {
      throw new NotFoundException('Cannot find a study');
    }

    return study;
  }

  private async checkStudyMember(studyId: number, userId: number) {
    const member = await this.prisma.studyMember.findUnique({
      where: {
        studyId_userId: {
          studyId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('Only study member can access.');
    }

    return member;
  }

  async create(studyId: number, userId: number, dto: CreateMaterialDto) {
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

  async findAll(studyId: number, userId: number) {
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
}
