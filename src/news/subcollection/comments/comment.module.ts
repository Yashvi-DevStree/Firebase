/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { FirebaseService } from 'src/firebase/firebase.service';

@Module({
  providers: [CommentService, FirebaseService]
})
export class CommentModule {}
