/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './seed/seed.service';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ErrorInterceptor } from './common/interceptors/error.interceptor';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(
    new ResponseInterceptor(),
    new ErrorInterceptor()
  )

  await app.init();

  // Run seeder AFTER Firebase is initialized
  const seeder = app.get(SeedService)
  await seeder.seedAdmin();
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  await app.listen(process.env.PORT ?? 3000);
  console.log('🚀 Server running at http://localhost:3000');
}
bootstrap();
