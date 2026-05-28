import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StudiesModule } from './studies/studies.module';
import { ApplicationsModule } from './applications/applications.module';
import { MaterialsModule } from './materials/materials.module';
import { PollsModule } from './polls/polls.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    StudiesModule,
    ApplicationsModule,
    MaterialsModule,
    PollsModule,
  ],
})
export class AppModule {}
