import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApplicationsService } from './applications.service';

@Controller()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('studies/:studyId/applications')
  apply(
    @Param('studyId', ParseIntPipe) studyId: number,
    @CurrentUser() user: any,
  ) {
    return this.applicationsService.apply(studyId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/applications')
  findMyApplications(@CurrentUser() user: any) {
    return this.applicationsService.findMyApplications(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('studies/:studyId/applications')
  findStudyApplications(
    @Param('studyId', ParseIntPipe) studyId: number,
    @CurrentUser() user: any,
  ) {
    return this.applicationsService.findStudyApplications(studyId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('applications/:applicationId/approve')
  approve(
    @Param('applicationId', ParseIntPipe) applicationId: number,
    @CurrentUser() user: any,
  ) {
    return this.applicationsService.approve(applicationId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('applications/:applicationId/reject')
  reject(
    @Param('applicationId', ParseIntPipe) applicationId: number,
    @CurrentUser() user: any,
  ) {
    return this.applicationsService.reject(applicationId, user.id);
  }
}
