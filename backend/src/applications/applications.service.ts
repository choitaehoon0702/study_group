import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async apply(studyId: number, userId: number) {
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
      throw new NotFoundException('Cannot find a study');
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
      throw new BadRequestException('Already joined');
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
      if (existingApplication.status === 'PENDING') {
        throw new BadRequestException('Already requested');
      }

      if (existingApplication.status === 'APPROVED') {
        throw new BadRequestException('Already approved');
      }

      if (existingApplication.status === 'REJECTED') {
        if (study._count.members >= study.maxMembers) {
          throw new BadRequestException('Study member is already full');
        }

        return this.prisma.studyApplication.update({
          where: {
            id: existingApplication.id,
          },
          data: {
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
      }
    }

    if (study._count.members >= study.maxMembers) {
      throw new BadRequestException('Study member is already full');
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

  async findMyApplications(userId: number) {
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

  async findStudyApplications(studyId: number, userId: number) {
    const study = await this.prisma.study.findUnique({
      where: {
        id: studyId,
      },
    });

    if (!study) {
      throw new NotFoundException('Cannot find a study');
    }

    if (study.leaderId !== userId) {
      throw new ForbiddenException('Only study leader can view this.');
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

  async approve(applicationId: number, leaderId: number) {
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
      throw new NotFoundException('Cannot find application info.');
    }

    if (application.study.leaderId !== leaderId) {
      throw new ForbiddenException('Only study leader can approve.');
    }

    if (application.status !== 'PENDING') {
      throw new BadRequestException('Already handled request');
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
      throw new BadRequestException('Already member of study');
    }

    if (application.study._count.members >= application.study.maxMembers) {
      throw new BadRequestException('Study member is already full');
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

  async reject(applicationId: number, leaderId: number) {
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
      throw new NotFoundException('Cannot find application info.');
    }

    if (application.study.leaderId !== leaderId) {
      throw new ForbiddenException('Only study leader can approve.');
    }

    if (application.status !== 'PENDING') {
      throw new BadRequestException('Already handled request.');
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
}
