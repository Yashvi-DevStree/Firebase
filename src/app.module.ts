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
import { CommentModule } from './news/subcollection/comments/comment.module';
import { StorageService } from './storage/storage.service';
import { StorageModule } from './storage/storage.module';
import { FirebaseService } from './firebase/firebase.service';
import { BookmarkService } from './news/subcollection/bookmark/bookmark.service';
import { BookmarkModule } from './news/subcollection/bookmark/bookmark.module';
import { ReactionModule } from './news/subcollection/reaction/reaction.module';

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
    BookmarkModule,
    ReactionModule,

  ],
  controllers: [AppController],
  providers: [AppService, FirebaseService, StorageService, BookmarkService],
})
export class AppModule { }
