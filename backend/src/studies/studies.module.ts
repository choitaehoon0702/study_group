import { Module } from '@nestjs/common';
import { StudiesController } from './studies.controller';
import { StudiesService } from './studies.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StudiesController],
  providers: [StudiesService],
})
export class StudiesModule {}
