import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FirebaseService } from 'src/firebase/firebase.service';

@Module({
  providers: [StorageService, FirebaseService],
  controllers: [],
})
export class StorageModule {}
