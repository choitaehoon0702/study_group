import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePollDto } from './dto/create-poll.dto';

@Injectable()
export class PollsService {
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

  private async checkStudyLeader(studyId: number, userId: number) {
    const study = await this.checkStudyExists(studyId);

    if (study.leaderId !== userId) {
      throw new ForbiddenException('Only study leader can access');
    }

    return study;
  }

  private async checkStudyMember(studyId: number, userId: number) {
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
      throw new ForbiddenException('Only study member can access');
    }

    return member;
  }

  async create(studyId: number, userId: number, dto: CreatePollDto) {
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

  async findAll(studyId: number, userId: number) {
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

  async vote(optionId: number, userId: number) {
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
      throw new NotFoundException('Cannot find vote option');
    }

    const poll = option.poll;

    if (poll.closed) {
      throw new BadRequestException('Closed vote');
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
      throw new BadRequestException('Already voted');
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

  async close(pollId: number, userId: number) {
    const poll = await this.prisma.studyPoll.findUnique({
      where: {
        id: pollId,
      },
      include: {
        study: true,
      },
    });

    if (!poll) {
      throw new NotFoundException('Cannot find a vote');
    }

    if (poll.study.leaderId !== userId) {
      throw new ForbiddenException('Only study leader can close the vote');
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
}
