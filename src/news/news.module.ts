import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { FirebaseService } from 'src/firebase/firebase.service';
import { CommentService } from './subcollection/comment.service';

@Module({
  providers: [NewsService, FirebaseService, CommentService],
  controllers: [NewsController],
})
export class NewsModule {}
