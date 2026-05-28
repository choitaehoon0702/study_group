import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudyDto } from './dto/create-study.dto';

@Injectable()
export class StudiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateStudyDto) {
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

  async findOne(studyId: number) {
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
                votes: true,
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
      throw new NotFoundException('Cannot find study');
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

  private async findStudyOrThrow(studyId: number) {
    const study = await this.prisma.study.findUnique({
      where: {
        id: studyId,
      },
    });

    if (!study) {
      throw new NotFoundException('Cannot find a study.');
    }

    return study;
  }

  async leaveStudy(studyId: number, userId: number) {
    const study = await this.findStudyOrThrow(studyId);

    if (study.leaderId === userId) {
      throw new BadRequestException('Studyleader cannot leave.');
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
      throw new ForbiddenException('Not a member of study.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.studyMember.delete({
        where: {
          studyId_userId: {
            studyId,
            userId,
          },
        },
      });

      await tx.studyApplication.deleteMany({
        where: {
          studyId,
          userId,
        },
      });
    });

    return {
      message: 'Leaved from study.',
      studyId,
      userId,
    };
  }

  async removeMember(
    studyId: number,
    targetUserId: number,
    requesterId: number,
  ) {
    const study = await this.findStudyOrThrow(studyId);

    if (study.leaderId !== requesterId) {
      throw new ForbiddenException('Only study leader can remove member.');
    }

    if (targetUserId === requesterId) {
      throw new BadRequestException('Study leader cannot remove himself.');
    }

    if (targetUserId === study.leaderId) {
      throw new BadRequestException('Study leader cannot remove himself.');
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
      throw new NotFoundException('Not a study member.');
    }

    if (targetMember.role === 'LEADER') {
      throw new BadRequestException('Study leader cannot remove himself.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.studyMember.delete({
        where: {
          studyId_userId: {
            studyId,
            userId: targetUserId,
          },
        },
      });

      await tx.studyApplication.deleteMany({
        where: {
          studyId,
          userId: targetUserId,
        },
      });
    });

    return {
      message: 'Removed study member.',
      studyId,
      removedUserId: targetUserId,
    };
  }
}
