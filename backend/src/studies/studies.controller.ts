import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StudiesService } from './studies.service';
import { CreateStudyDto } from './dto/create-study.dto';

@Controller('studies')
export class StudiesController {
  constructor(private readonly studiesService: StudiesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateStudyDto) {
    return this.studiesService.create(user.id, dto);
  }

  @Get()
  findAll() {
    return this.studiesService.findAll();
  }

  @Get(':studyId')
  findOne(@Param('studyId', ParseIntPipe) studyId: number) {
    return this.studiesService.findOne(studyId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':studyId/leave')
  leaveStudy(
    @Param('studyId', ParseIntPipe) studyId: number,
    @CurrentUser() user: any,
  ) {
    return this.studiesService.leaveStudy(studyId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':studyId/members/:userId')
  removeMember(
    @Param('studyId', ParseIntPipe) studyId: number,
    @Param('userId', ParseIntPipe) targetUserId: number,
    @CurrentUser() user: any,
  ) {
    return this.studiesService.removeMember(studyId, targetUserId, user.id);
  }
}
