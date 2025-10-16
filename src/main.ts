/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.init();

  // Run seeder AFTER Firebase is initialized
  const seeder = app.get(SeedService)
  await seeder.seedAdmin();
  await app.listen(process.env.PORT ?? 3000);
  console.log('🚀 Server running at http://localhost:3000');
}
bootstrap();
