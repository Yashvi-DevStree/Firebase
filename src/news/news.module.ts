import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { FirebaseService } from 'src/firebase/firebase.service';
import { CommentService } from './subcollection/comment.service';
import { BookmarkService } from './subcollection/bookmark.service';

@Module({
  providers: [NewsService, FirebaseService, CommentService, BookmarkService],
  controllers: [NewsController],
})
export class NewsModule {}
