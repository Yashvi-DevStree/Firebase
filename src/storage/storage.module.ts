import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { FirebaseService } from 'src/firebase/firebase.service';

@Module({
  providers: [StorageService, FirebaseService],
  controllers: [StorageController],
})
export class StorageModule {}
