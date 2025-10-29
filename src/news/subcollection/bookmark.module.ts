/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { BookmarkController } from './bookmark.controller';
import { FirebaseService } from 'src/firebase/firebase.service';

@Module({
    providers: [BookmarkService, FirebaseService],
    controllers: [BookmarkController]
})
export class BookmarkModule {}
