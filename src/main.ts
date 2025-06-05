import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: '*',
  });

  // static files
  app.useStaticAssets(join(__dirname, '..', 'public/images'));

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
