import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';

@Controller('studies/:studyId/materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Param('studyId', ParseIntPipe) studyId: number,
    @CurrentUser() user: any,
    @Body() dto: CreateMaterialDto,
  ) {
    return this.materialsService.create(studyId, user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Param('studyId', ParseIntPipe) studyId: number,
    @CurrentUser() user: any,
  ) {
    return this.materialsService.findAll(studyId, user.id);
  }
}
