import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { FirebaseService } from 'src/firebase/firebase.service';
import { CommentService } from './subcollection/comment.service';
import { StorageService } from 'src/storage/storage.service';

@Module({
  providers: [NewsService, FirebaseService, CommentService, StorageService],
  controllers: [NewsController],
})
export class NewsModule {}
