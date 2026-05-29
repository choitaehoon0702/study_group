import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://autumn.newbie.sparcs.net',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //Delete field not mentioned in DTO
      transform: true, // Transform request body into DTO class instance
    }),
  );

  const port = Number(process.env.PORT) || 8000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
