/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { NewsModule } from './news/news.module';
import { SeedModule } from './seed/seed.module';
import { CommentModule } from './news/subcollection/comment.module';
import { StorageController } from './storage/storage.controller';
import { StorageService } from './storage/storage.service';
import { StorageModule } from './storage/storage.module';
import { FirebaseService } from './firebase/firebase.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    FirebaseModule,
    StorageModule,
    SeedModule,
    UserModule,
    AuthModule,
    NewsModule,
    CommentModule,
    
    ],
  controllers: [AppController, StorageController],
  providers: [AppService, FirebaseService, StorageService],
})
export class AppModule {}
 