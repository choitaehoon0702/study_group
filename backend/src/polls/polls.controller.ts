import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PollsService } from './polls.service';
import { CreatePollDto } from './dto/create-poll.dto';

@Controller()
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('studies/:studyId/polls')
  create(
    @Param('studyId', ParseIntPipe) studyId: number,
    @CurrentUser() user: any,
    @Body() dto: CreatePollDto,
  ) {
    return this.pollsService.create(studyId, user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('studies/:studyId/polls')
  findAll(
    @Param('studyId', ParseIntPipe) studyId: number,
    @CurrentUser() user: any,
  ) {
    return this.pollsService.findAll(studyId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('poll-options/:optionId/vote')
  vote(
    @Param('optionId', ParseIntPipe) optionId: number,
    @CurrentUser() user: any,
  ) {
    return this.pollsService.vote(optionId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('polls/:pollId/close')
  close(
    @Param('pollId', ParseIntPipe) pollId: number,
    @CurrentUser() user: any,
  ) {
    return this.pollsService.close(pollId, user.id);
  }
}
